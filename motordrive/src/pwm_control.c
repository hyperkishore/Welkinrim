#include "pwm_control.h"
#include "config.h"

static PWM_Handle_t pwmHandle;

PWM_Status_t PWM_Init(void)
{
    TIM_OC_InitTypeDef sConfigOC = {0};
    
    __HAL_RCC_TIM3_CLK_ENABLE();
    __HAL_RCC_GPIOC_CLK_ENABLE();
    
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_6;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    GPIO_InitStruct.Alternate = GPIO_AF2_TIM3;
    HAL_GPIO_Init(GPIOC, &GPIO_InitStruct);
    
    pwmHandle.htim.Instance = TIM3;
    pwmHandle.htim.Init.Prescaler = (SystemCoreClock / PWM_TIMER_FREQ) - 1;
    pwmHandle.htim.Init.CounterMode = TIM_COUNTERMODE_UP;
    pwmHandle.htim.Init.Period = PWM_PERIOD - 1;
    pwmHandle.htim.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
    pwmHandle.htim.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    
    if (HAL_TIM_PWM_Init(&pwmHandle.htim) != HAL_OK)
    {
        return PWM_ERROR;
    }
    
    sConfigOC.OCMode = TIM_OCMODE_PWM1;
    sConfigOC.Pulse = PWM_NEUTRAL_PULSE;
    sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
    sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
    
    if (HAL_TIM_PWM_ConfigChannel(&pwmHandle.htim, &sConfigOC, TIM_CHANNEL_1) != HAL_OK)
    {
        return PWM_ERROR;
    }
    
    pwmHandle.channel = TIM_CHANNEL_1;
    pwmHandle.currentPulse = PWM_NEUTRAL_PULSE;
    pwmHandle.dutyCycle = 0.0f;
    
    return PWM_OK;
}

PWM_Status_t PWM_SetPulseWidth(uint16_t pulseWidth)
{
    if (pulseWidth < PWM_MIN_PULSE || pulseWidth > PWM_MAX_PULSE)
    {
        return PWM_ERROR;
    }
    
    __HAL_TIM_SET_COMPARE(&pwmHandle.htim, pwmHandle.channel, pulseWidth);
    pwmHandle.currentPulse = pulseWidth;
    
    pwmHandle.dutyCycle = ((float)(pulseWidth - PWM_MIN_PULSE) / 
                          (PWM_MAX_PULSE - PWM_MIN_PULSE)) * 100.0f;
    
    return PWM_OK;
}

PWM_Status_t PWM_SetDutyCycle(float dutyCycle)
{
    if (dutyCycle < 0.0f || dutyCycle > 100.0f)
    {
        return PWM_ERROR;
    }
    
    uint16_t pulseWidth = PWM_MIN_PULSE + (uint16_t)((dutyCycle / 100.0f) * 
                                                    (PWM_MAX_PULSE - PWM_MIN_PULSE));
    
    return PWM_SetPulseWidth(pulseWidth);
}

PWM_Status_t PWM_Start(void)
{
    if (HAL_TIM_PWM_Start(&pwmHandle.htim, pwmHandle.channel) != HAL_OK)
    {
        return PWM_ERROR;
    }
    return PWM_OK;
}

PWM_Status_t PWM_Stop(void)
{
    if (HAL_TIM_PWM_Stop(&pwmHandle.htim, pwmHandle.channel) != HAL_OK)
    {
        return PWM_ERROR;
    }
    return PWM_OK;
}

uint16_t PWM_GetCurrentPulse(void)
{
    return pwmHandle.currentPulse;
}

float PWM_GetCurrentDutyCycle(void)
{
    return pwmHandle.dutyCycle;
}