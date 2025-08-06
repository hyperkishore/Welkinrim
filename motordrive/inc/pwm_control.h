#ifndef PWM_CONTROL_H
#define PWM_CONTROL_H

#include "stm32f4xx_hal.h"
#include <stdint.h>

#define PWM_TIMER_FREQ      1000000
#define PWM_FREQUENCY       50
#define PWM_PERIOD          (PWM_TIMER_FREQ / PWM_FREQUENCY)

#define PWM_MIN_PULSE       1000
#define PWM_MAX_PULSE       2000
#define PWM_NEUTRAL_PULSE   1500

typedef struct {
    TIM_HandleTypeDef htim;
    uint32_t channel;
    uint16_t currentPulse;
    float dutyCycle;
} PWM_Handle_t;

typedef enum {
    PWM_OK = 0,
    PWM_ERROR,
    PWM_TIMEOUT
} PWM_Status_t;

PWM_Status_t PWM_Init(void);
PWM_Status_t PWM_SetPulseWidth(uint16_t pulseWidth);
PWM_Status_t PWM_SetDutyCycle(float dutyCycle);
PWM_Status_t PWM_Stop(void);
PWM_Status_t PWM_Start(void);
uint16_t PWM_GetCurrentPulse(void);
float PWM_GetCurrentDutyCycle(void);

#endif