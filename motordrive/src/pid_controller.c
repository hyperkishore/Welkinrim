#include "pid_controller.h"
#include "stm32f4xx_hal.h"
#include <math.h>

PID_Status_t PID_Init(PIDController_t *pid, float kp, float ki, float kd, float sampleRate)
{
    if (pid == NULL || sampleRate <= 0.0f)
    {
        return PID_INVALID_PARAM;
    }
    
    pid->kp = kp;
    pid->ki = ki;
    pid->kd = kd;
    
    pid->previousError = 0.0f;
    pid->integral = 0.0f;
    pid->derivative = 0.0f;
    
    pid->outputMin = -100.0f;
    pid->outputMax = 100.0f;
    
    pid->setpoint = 0.0f;
    pid->output = 0.0f;
    
    pid->sampleTime = 1.0f / sampleRate;
    pid->lastUpdateTime = HAL_GetTick();
    
    pid->antiWindup = true;
    pid->integralMax = 50.0f;
    
    return PID_OK;
}

PID_Status_t PID_SetTunings(PIDController_t *pid, float kp, float ki, float kd)
{
    if (pid == NULL)
    {
        return PID_INVALID_PARAM;
    }
    
    pid->kp = kp;
    pid->ki = ki;
    pid->kd = kd;
    
    return PID_OK;
}

PID_Status_t PID_SetOutputLimits(PIDController_t *pid, float min, float max)
{
    if (pid == NULL || min >= max)
    {
        return PID_INVALID_PARAM;
    }
    
    pid->outputMin = min;
    pid->outputMax = max;
    
    if (pid->output > max)
    {
        pid->output = max;
    }
    else if (pid->output < min)
    {
        pid->output = min;
    }
    
    return PID_OK;
}

PID_Status_t PID_SetSampleTime(PIDController_t *pid, float sampleTime)
{
    if (pid == NULL || sampleTime <= 0.0f)
    {
        return PID_INVALID_PARAM;
    }
    
    float ratio = sampleTime / pid->sampleTime;
    
    pid->ki *= ratio;
    pid->kd /= ratio;
    pid->sampleTime = sampleTime;
    
    return PID_OK;
}

PID_Status_t PID_SetAntiWindup(PIDController_t *pid, bool enable, float maxIntegral)
{
    if (pid == NULL)
    {
        return PID_INVALID_PARAM;
    }
    
    pid->antiWindup = enable;
    pid->integralMax = maxIntegral;
    
    return PID_OK;
}

float PID_Update(PIDController_t *pid, float setpoint, float input)
{
    if (pid == NULL)
    {
        return 0.0f;
    }
    
    uint32_t currentTime = HAL_GetTick();
    float deltaTime = (currentTime - pid->lastUpdateTime) / 1000.0f;
    
    if (deltaTime < pid->sampleTime)
    {
        return pid->output;
    }
    
    pid->setpoint = setpoint;
    float error = setpoint - input;
    
    pid->integral += error * deltaTime;
    
    if (pid->antiWindup)
    {
        if (pid->integral > pid->integralMax)
        {
            pid->integral = pid->integralMax;
        }
        else if (pid->integral < -pid->integralMax)
        {
            pid->integral = -pid->integralMax;
        }
    }
    
    pid->derivative = (error - pid->previousError) / deltaTime;
    
    pid->output = (pid->kp * error) + (pid->ki * pid->integral) + (pid->kd * pid->derivative);
    
    if (pid->output > pid->outputMax)
    {
        pid->output = pid->outputMax;
    }
    else if (pid->output < pid->outputMin)
    {
        pid->output = pid->outputMin;
    }
    
    pid->previousError = error;
    pid->lastUpdateTime = currentTime;
    
    return pid->output;
}

void PID_Reset(PIDController_t *pid)
{
    if (pid == NULL)
    {
        return;
    }
    
    pid->previousError = 0.0f;
    pid->integral = 0.0f;
    pid->derivative = 0.0f;
    pid->output = 0.0f;
    pid->lastUpdateTime = HAL_GetTick();
}

float PID_GetOutput(PIDController_t *pid)
{
    if (pid == NULL)
    {
        return 0.0f;
    }
    
    return pid->output;
}

float PID_GetError(PIDController_t *pid)
{
    if (pid == NULL)
    {
        return 0.0f;
    }
    
    return pid->previousError;
}