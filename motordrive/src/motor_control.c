#include "motor_control.h"
#include "config.h"

MotorStatus_t MotorControl_Init(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    motor->state = MOTOR_STOPPED;
    motor->targetSpeed = 0.0f;
    motor->currentSpeed = 0.0f;
    motor->dutyCycle = 0.0f;
    motor->lastUpdateTime = HAL_GetTick();
    motor->isCalibrated = false;
    motor->minPulse = PWM_MIN_PULSE;
    motor->maxPulse = PWM_MAX_PULSE;
    
    if (PWM_Init() != PWM_OK)
    {
        return MOTOR_ERROR;
    }
    
    PWM_SetPulseWidth(PWM_NEUTRAL_PULSE);
    
    return MOTOR_OK;
}

MotorStatus_t MotorControl_SetSpeed(MotorControl_t *motor, float speed)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    if (speed < 0.0f || speed > 100.0f)
    {
        return MOTOR_INVALID_SPEED;
    }
    
    if (!motor->isCalibrated && speed > 0.0f)
    {
        return MOTOR_NOT_CALIBRATED;
    }
    
    motor->targetSpeed = speed;
    
    if (speed == 0.0f)
    {
        motor->state = MOTOR_STOPPED;
        motor->dutyCycle = 0.0f;
        PWM_SetPulseWidth(PWM_MIN_PULSE);
    }
    else
    {
        motor->state = MOTOR_RUNNING;
        motor->dutyCycle = speed;
        
        uint16_t pulseWidth = motor->minPulse + 
            (uint16_t)((speed / 100.0f) * (motor->maxPulse - motor->minPulse));
        
        PWM_SetPulseWidth(pulseWidth);
    }
    
    return MOTOR_OK;
}

MotorStatus_t MotorControl_Stop(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    motor->state = MOTOR_STOPPED;
    motor->targetSpeed = 0.0f;
    motor->currentSpeed = 0.0f;
    motor->dutyCycle = 0.0f;
    
    PWM_SetPulseWidth(PWM_MIN_PULSE);
    PWM_Stop();
    
    return MOTOR_OK;
}

MotorStatus_t MotorControl_Start(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    if (PWM_Start() != PWM_OK)
    {
        return MOTOR_ERROR;
    }
    
    motor->state = MOTOR_STARTING;
    return MOTOR_OK;
}

MotorStatus_t MotorControl_Calibrate(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    motor->state = MOTOR_CALIBRATING;
    
    PWM_SetPulseWidth(PWM_MAX_PULSE);
    HAL_Delay(2000);
    
    PWM_SetPulseWidth(PWM_MIN_PULSE);
    HAL_Delay(2000);
    
    motor->minPulse = PWM_MIN_PULSE;
    motor->maxPulse = PWM_MAX_PULSE;
    motor->isCalibrated = true;
    motor->state = MOTOR_STOPPED;
    
    return MOTOR_OK;
}

float MotorControl_GetCurrentSpeed(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return 0.0f;
    }
    
    return motor->currentSpeed;
}

MotorState_t MotorControl_GetState(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return MOTOR_ERROR;
    }
    
    return motor->state;
}

void MotorControl_Update(MotorControl_t *motor)
{
    if (motor == NULL)
    {
        return;
    }
    
    uint32_t currentTime = HAL_GetTick();
    float deltaTime = (currentTime - motor->lastUpdateTime) / 1000.0f;
    motor->lastUpdateTime = currentTime;
    
    if (motor->state == MOTOR_RUNNING)
    {
        float speedDiff = motor->targetSpeed - motor->currentSpeed;
        float maxChange = MOTOR_ACCELERATION_RATE * deltaTime;
        
        if (speedDiff > maxChange)
        {
            motor->currentSpeed += maxChange;
        }
        else if (speedDiff < -maxChange)
        {
            motor->currentSpeed -= maxChange;
        }
        else
        {
            motor->currentSpeed = motor->targetSpeed;
        }
        
        if (motor->currentSpeed < 0.0f)
        {
            motor->currentSpeed = 0.0f;
        }
        else if (motor->currentSpeed > 100.0f)
        {
            motor->currentSpeed = 100.0f;
        }
    }
    else if (motor->state == MOTOR_STOPPED)
    {
        motor->currentSpeed = 0.0f;
    }
}