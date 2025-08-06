#ifndef CAN_INTERFACE_H
#define CAN_INTERFACE_H

#include "stm32f4xx_hal.h"
#include <stdint.h>
#include <stdbool.h>

#define CAN_MOTOR_STATUS_ID     0x100
#define CAN_MOTOR_COMMAND_ID    0x101
#define CAN_CALIBRATE_ID        0x102
#define CAN_ERROR_ID            0x103

#define CAN_MAX_DATA_LEN        8

typedef enum {
    CAN_OK = 0,
    CAN_ERROR,
    CAN_TIMEOUT,
    CAN_BUSY
} CAN_Status_t;

typedef enum {
    CAN_MSG_MOTOR_STATUS = 0,
    CAN_MSG_MOTOR_COMMAND,
    CAN_MSG_CALIBRATE,
    CAN_MSG_ERROR
} CAN_MessageType_t;

typedef struct {
    uint32_t id;
    uint8_t data[CAN_MAX_DATA_LEN];
    uint8_t length;
    CAN_MessageType_t type;
    uint32_t timestamp;
} CAN_Message_t;

typedef struct {
    float motorSpeed;
    float dutyCycle;
    uint8_t motorState;
    uint32_t errorCode;
} CAN_MotorStatus_t;

typedef struct {
    float targetSpeed;
    uint8_t command;
} CAN_MotorCommand_t;

CAN_Status_t CAN_Init(void);
CAN_Status_t CAN_SendMessage(CAN_Message_t *message);
CAN_Status_t CAN_ReceiveMessage(CAN_Message_t *message);
CAN_Status_t CAN_SendMotorStatus(float speed, float dutyCycle);
CAN_Status_t CAN_SendError(uint32_t errorCode);
bool CAN_IsMessageAvailable(void);
void CAN_ProcessMessages(void);

extern volatile bool canMessageReceived;

#endif