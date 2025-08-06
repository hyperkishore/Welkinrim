#include "pixhawk_interface.h"
#include "config.h"

static Pixhawk_Handle_t pixhawkHandle;
static TIM_HandleTypeDef htimCapture;

static void Pixhawk_InputCaptureConfig(void);
static void Pixhawk_UpdateThrottlePercent(void);

Pixhawk_Status_t Pixhawk_Init(void)
{
    pixhawkHandle.throttlePulse = PIXHAWK_PWM_NEUTRAL;
    pixhawkHandle.throttlePercent = 0.0f;
    pixhawkHandle.lastSignalTime = HAL_GetTick();
    pixhawkHandle.state = PIXHAWK_DISCONNECTED;
    pixhawkHandle.signalValid = false;
    
    Pixhawk_InputCaptureConfig();
    
    if (HAL_TIM_IC_Start_IT(&htimCapture, TIM_CHANNEL_2) != HAL_OK)
    {
        return PIXHAWK_ERROR;
    }
    
    return PIXHAWK_OK;
}

static void Pixhawk_InputCaptureConfig(void)
{
    TIM_IC_InitTypeDef sConfigIC = {0};
    
    __HAL_RCC_TIM4_CLK_ENABLE();
    __HAL_RCC_GPIOB_CLK_ENABLE();
    
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_7;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    GPIO_InitStruct.Alternate = GPIO_AF2_TIM4;
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
    
    htimCapture.Instance = TIM4;
    htimCapture.Init.Prescaler = (SystemCoreClock / 1000000) - 1;
    htimCapture.Init.CounterMode = TIM_COUNTERMODE_UP;
    htimCapture.Init.Period = 65535;
    htimCapture.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
    htimCapture.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    
    if (HAL_TIM_IC_Init(&htimCapture) != HAL_OK)
    {
        return;
    }
    
    sConfigIC.ICPolarity = TIM_INPUTCHANNELPOLARITY_RISING;
    sConfigIC.ICSelection = TIM_ICSELECTION_DIRECTTI;
    sConfigIC.ICPrescaler = TIM_ICPSC_DIV1;
    sConfigIC.ICFilter = 0;
    
    if (HAL_TIM_IC_ConfigChannel(&htimCapture, &sConfigIC, TIM_CHANNEL_2) != HAL_OK)
    {
        return;
    }
}

float Pixhawk_GetThrottleCommand(void)
{
    Pixhawk_Update();
    
    if (!pixhawkHandle.signalValid)
    {
        return 0.0f;
    }
    
    return pixhawkHandle.throttlePercent;
}

uint16_t Pixhawk_GetThrottlePulse(void)
{
    return pixhawkHandle.throttlePulse;
}

Pixhawk_State_t Pixhawk_GetState(void)
{
    return pixhawkHandle.state;
}

bool Pixhawk_IsSignalValid(void)
{
    return pixhawkHandle.signalValid;
}

void Pixhawk_ProcessCommands(void)
{
    
}

void Pixhawk_Update(void)
{
    uint32_t currentTime = HAL_GetTick();
    
    if ((currentTime - pixhawkHandle.lastSignalTime) > PIXHAWK_TIMEOUT_MS)
    {
        pixhawkHandle.state = PIXHAWK_SIGNAL_LOST;
        pixhawkHandle.signalValid = false;
        pixhawkHandle.throttlePercent = 0.0f;
    }
}

static void Pixhawk_UpdateThrottlePercent(void)
{
    if (pixhawkHandle.throttlePulse < PIXHAWK_PWM_MIN)
    {
        pixhawkHandle.throttlePercent = 0.0f;
    }
    else if (pixhawkHandle.throttlePulse > PIXHAWK_PWM_MAX)
    {
        pixhawkHandle.throttlePercent = 100.0f;
    }
    else
    {
        pixhawkHandle.throttlePercent = ((float)(pixhawkHandle.throttlePulse - PIXHAWK_PWM_MIN) /
                                        (PIXHAWK_PWM_MAX - PIXHAWK_PWM_MIN)) * 100.0f;
    }
}

static uint32_t previousCapture = 0;
static uint32_t currentCapture = 0;
static uint8_t captureState = 0;

void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM4 && htim->Channel == HAL_TIM_ACTIVE_CHANNEL_2)
    {
        if (captureState == 0)
        {
            previousCapture = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_2);
            
            TIM_IC_InitTypeDef sConfigIC = {0};
            sConfigIC.ICPolarity = TIM_INPUTCHANNELPOLARITY_FALLING;
            sConfigIC.ICSelection = TIM_ICSELECTION_DIRECTTI;
            sConfigIC.ICPrescaler = TIM_ICPSC_DIV1;
            sConfigIC.ICFilter = 0;
            HAL_TIM_IC_ConfigChannel(htim, &sConfigIC, TIM_CHANNEL_2);
            
            captureState = 1;
        }
        else if (captureState == 1)
        {
            currentCapture = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_2);
            
            uint32_t pulseWidth;
            if (currentCapture > previousCapture)
            {
                pulseWidth = currentCapture - previousCapture;
            }
            else
            {
                pulseWidth = (65536 + currentCapture) - previousCapture;
            }
            
            if (pulseWidth >= PIXHAWK_PWM_MIN && pulseWidth <= PIXHAWK_PWM_MAX)
            {
                pixhawkHandle.throttlePulse = pulseWidth;
                pixhawkHandle.lastSignalTime = HAL_GetTick();
                pixhawkHandle.signalValid = true;
                pixhawkHandle.state = PIXHAWK_CONNECTED;
                
                Pixhawk_UpdateThrottlePercent();
            }
            
            TIM_IC_InitTypeDef sConfigIC = {0};
            sConfigIC.ICPolarity = TIM_INPUTCHANNELPOLARITY_RISING;
            sConfigIC.ICSelection = TIM_ICSELECTION_DIRECTTI;
            sConfigIC.ICPrescaler = TIM_ICPSC_DIV1;
            sConfigIC.ICFilter = 0;
            HAL_TIM_IC_ConfigChannel(htim, &sConfigIC, TIM_CHANNEL_2);
            
            captureState = 0;
        }
    }
}