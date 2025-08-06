#ifndef MOTOR_CONTROL_H
#define MOTOR_CONTROL_H

#include "stm32f4xx_hal.h"
#include "pwm_control.h"
#include <stdint.h>
#include <stdbool.h>

typedef enum {
    MOTOR_STOPPED = 0,
    MOTOR_STARTING,
    MOTOR_RUNNING,
    MOTOR_CALIBRATING,
    MOTOR_ERROR
} MotorState_t;

typedef struct {
    MotorState_t state;
    float targetSpeed;
    float currentSpeed;
    float dutyCycle;
    uint32_t lastUpdateTime;
    bool isCalibrated;
    uint16_t minPulse;
    uint16_t maxPulse;
} MotorControl_t;

typedef enum {
    MOTOR_OK = 0,
    MOTOR_ERROR,
    MOTOR_NOT_CALIBRATED,
    MOTOR_INVALID_SPEED
} MotorStatus_t;

MotorStatus_t MotorControl_Init(MotorControl_t *motor);
MotorStatus_t MotorControl_SetSpeed(MotorControl_t *motor, float speed);
MotorStatus_t MotorControl_Stop(MotorControl_t *motor);
MotorStatus_t MotorControl_Start(MotorControl_t *motor);
MotorStatus_t MotorControl_Calibrate(MotorControl_t *motor);
float MotorControl_GetCurrentSpeed(MotorControl_t *motor);
MotorState_t MotorControl_GetState(MotorControl_t *motor);
void MotorControl_Update(MotorControl_t *motor);

#endif