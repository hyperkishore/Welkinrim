#include "can_interface.h"
#include "config.h"
#include <string.h>

static CAN_HandleTypeDef hcan;
static CAN_Message_t rxBuffer[CAN_RX_BUFFER_SIZE];
static volatile uint8_t rxBufferHead = 0;
static volatile uint8_t rxBufferTail = 0;
volatile bool canMessageReceived = false;

static void CAN_FilterConfig(void);
static void CAN_PackMotorStatus(CAN_Message_t *msg, float speed, float dutyCycle);
static void CAN_UnpackMotorCommand(CAN_Message_t *msg, CAN_MotorCommand_t *cmd);

CAN_Status_t CAN_Init(void)
{
    __HAL_RCC_CAN1_CLK_ENABLE();
    __HAL_RCC_GPIOD_CLK_ENABLE();
    
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    
    GPIO_InitStruct.Pin = GPIO_PIN_0 | GPIO_PIN_1;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_VERY_HIGH;
    GPIO_InitStruct.Alternate = GPIO_AF9_CAN1;
    HAL_GPIO_Init(GPIOD, &GPIO_InitStruct);
    
    hcan.Instance = CAN1;
    hcan.Init.Prescaler = 21;
    hcan.Init.Mode = CAN_MODE_NORMAL;
    hcan.Init.SyncJumpWidth = CAN_SJW_1TQ;
    hcan.Init.TimeSeg1 = CAN_BS1_6TQ;
    hcan.Init.TimeSeg2 = CAN_BS2_1TQ;
    hcan.Init.TimeTriggeredMode = DISABLE;
    hcan.Init.AutoBusOff = DISABLE;
    hcan.Init.AutoWakeUp = DISABLE;
    hcan.Init.AutoRetransmission = ENABLE;
    hcan.Init.ReceiveFifoLocked = DISABLE;
    hcan.Init.TransmitFifoPriority = DISABLE;
    
    if (HAL_CAN_Init(&hcan) != HAL_OK)
    {
        return CAN_ERROR;
    }
    
    CAN_FilterConfig();
    
    if (HAL_CAN_Start(&hcan) != HAL_OK)
    {
        return CAN_ERROR;
    }
    
    if (HAL_CAN_ActivateNotification(&hcan, CAN_IT_RX_FIFO0_MSG_PENDING) != HAL_OK)
    {
        return CAN_ERROR;
    }
    
    rxBufferHead = 0;
    rxBufferTail = 0;
    
    return CAN_OK;
}

static void CAN_FilterConfig(void)
{
    CAN_FilterTypeDef sFilterConfig;
    
    sFilterConfig.FilterBank = 0;
    sFilterConfig.FilterMode = CAN_FILTERMODE_IDMASK;
    sFilterConfig.FilterScale = CAN_FILTERSCALE_32BIT;
    sFilterConfig.FilterIdHigh = 0x0000;
    sFilterConfig.FilterIdLow = 0x0000;
    sFilterConfig.FilterMaskIdHigh = 0x0000;
    sFilterConfig.FilterMaskIdLow = 0x0000;
    sFilterConfig.FilterFIFOAssignment = CAN_RX_FIFO0;
    sFilterConfig.FilterActivation = ENABLE;
    sFilterConfig.SlaveStartFilterBank = 14;
    
    HAL_CAN_ConfigFilter(&hcan, &sFilterConfig);
}

CAN_Status_t CAN_SendMessage(CAN_Message_t *message)
{
    if (message == NULL)
    {
        return CAN_ERROR;
    }
    
    CAN_TxHeaderTypeDef txHeader;
    uint32_t txMailbox;
    
    txHeader.StdId = message->id;
    txHeader.ExtId = 0;
    txHeader.RTR = CAN_RTR_DATA;
    txHeader.IDE = CAN_ID_STD;
    txHeader.DLC = message->length;
    txHeader.TransmitGlobalTime = DISABLE;
    
    if (HAL_CAN_AddTxMessage(&hcan, &txHeader, message->data, &txMailbox) != HAL_OK)
    {
        return CAN_ERROR;
    }
    
    return CAN_OK;
}

CAN_Status_t CAN_ReceiveMessage(CAN_Message_t *message)
{
    if (message == NULL)
    {
        return CAN_ERROR;
    }
    
    if (rxBufferHead == rxBufferTail)
    {
        return CAN_TIMEOUT;
    }
    
    *message = rxBuffer[rxBufferTail];
    rxBufferTail = (rxBufferTail + 1) % CAN_RX_BUFFER_SIZE;
    
    return CAN_OK;
}

CAN_Status_t CAN_SendMotorStatus(float speed, float dutyCycle)
{
    CAN_Message_t msg;
    CAN_PackMotorStatus(&msg, speed, dutyCycle);
    return CAN_SendMessage(&msg);
}

CAN_Status_t CAN_SendError(uint32_t errorCode)
{
    CAN_Message_t msg;
    
    msg.id = CAN_ERROR_ID;
    msg.length = 4;
    msg.type = CAN_MSG_ERROR;
    msg.timestamp = HAL_GetTick();
    
    msg.data[0] = (errorCode >> 24) & 0xFF;
    msg.data[1] = (errorCode >> 16) & 0xFF;
    msg.data[2] = (errorCode >> 8) & 0xFF;
    msg.data[3] = errorCode & 0xFF;
    
    return CAN_SendMessage(&msg);
}

bool CAN_IsMessageAvailable(void)
{
    return (rxBufferHead != rxBufferTail);
}

void CAN_ProcessMessages(void)
{
    CAN_Message_t message;
    
    while (CAN_ReceiveMessage(&message) == CAN_OK)
    {
        switch (message.id)
        {
            case CAN_MOTOR_COMMAND_ID:
            {
                CAN_MotorCommand_t cmd;
                CAN_UnpackMotorCommand(&message, &cmd);
                break;
            }
            
            case CAN_CALIBRATE_ID:
            {
                break;
            }
            
            default:
                break;
        }
    }
}

static void CAN_PackMotorStatus(CAN_Message_t *msg, float speed, float dutyCycle)
{
    msg->id = CAN_MOTOR_STATUS_ID;
    msg->length = 8;
    msg->type = CAN_MSG_MOTOR_STATUS;
    msg->timestamp = HAL_GetTick();
    
    uint32_t speedInt = *(uint32_t*)&speed;
    uint32_t dutyInt = *(uint32_t*)&dutyCycle;
    
    msg->data[0] = (speedInt >> 24) & 0xFF;
    msg->data[1] = (speedInt >> 16) & 0xFF;
    msg->data[2] = (speedInt >> 8) & 0xFF;
    msg->data[3] = speedInt & 0xFF;
    
    msg->data[4] = (dutyInt >> 24) & 0xFF;
    msg->data[5] = (dutyInt >> 16) & 0xFF;
    msg->data[6] = (dutyInt >> 8) & 0xFF;
    msg->data[7] = dutyInt & 0xFF;
}

static void CAN_UnpackMotorCommand(CAN_Message_t *msg, CAN_MotorCommand_t *cmd)
{
    uint32_t speedInt = (msg->data[0] << 24) | (msg->data[1] << 16) | 
                       (msg->data[2] << 8) | msg->data[3];
    
    cmd->targetSpeed = *(float*)&speedInt;
    cmd->command = msg->data[4];
}

void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
    CAN_RxHeaderTypeDef rxHeader;
    uint8_t rxData[8];
    
    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rxHeader, rxData) == HAL_OK)
    {
        uint8_t nextHead = (rxBufferHead + 1) % CAN_RX_BUFFER_SIZE;
        
        if (nextHead != rxBufferTail)
        {
            rxBuffer[rxBufferHead].id = rxHeader.StdId;
            rxBuffer[rxBufferHead].length = rxHeader.DLC;
            rxBuffer[rxBufferHead].timestamp = HAL_GetTick();
            
            memcpy(rxBuffer[rxBufferHead].data, rxData, rxHeader.DLC);
            
            rxBufferHead = nextHead;
            canMessageReceived = true;
        }
    }
}