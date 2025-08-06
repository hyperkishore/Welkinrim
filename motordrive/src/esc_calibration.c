#include "esc_calibration.h"
#include "pwm_control.h"
#include "config.h"

#define ESC_CAL_HIGH_PULSE_TIME_MS  3000
#define ESC_CAL_LOW_PULSE_TIME_MS   3000
#define ESC_CAL_INIT_TIME_MS        1000

ESC_CalStatus_t ESC_StartCalibration(ESC_Calibration_t *cal, uint32_t timeoutMs)
{
    if (cal == NULL)
    {
        return ESC_CAL_ERROR;
    }
    
    cal->state = ESC_CAL_INIT;
    cal->stateStartTime = HAL_GetTick();
    cal->highPulse = PWM_MAX_PULSE;
    cal->lowPulse = PWM_MIN_PULSE;
    cal->calibrationComplete = false;
    cal->timeoutMs = timeoutMs;
    
    PWM_Start();
    PWM_SetPulseWidth(PWM_NEUTRAL_PULSE);
    
    return ESC_CAL_OK;
}

ESC_CalStatus_t ESC_UpdateCalibration(ESC_Calibration_t *cal, MotorControl_t *motor)
{
    if (cal == NULL || motor == NULL)
    {
        return ESC_CAL_ERROR;
    }
    
    uint32_t currentTime = HAL_GetTick();
    uint32_t elapsedTime = currentTime - cal->stateStartTime;
    
    if (cal->timeoutMs > 0 && elapsedTime > cal->timeoutMs)
    {
        cal->state = ESC_CAL_FAILED;
        PWM_SetPulseWidth(PWM_MIN_PULSE);
        return ESC_CAL_TIMEOUT;
    }
    
    switch (cal->state)
    {
        case ESC_CAL_INIT:
            if (elapsedTime >= ESC_CAL_INIT_TIME_MS)
            {
                cal->state = ESC_CAL_HIGH_PULSE;
                cal->stateStartTime = currentTime;
                PWM_SetPulseWidth(cal->highPulse);
            }
            break;
            
        case ESC_CAL_HIGH_PULSE:
            if (elapsedTime >= ESC_CAL_HIGH_PULSE_TIME_MS)
            {
                cal->state = ESC_CAL_LOW_PULSE;
                cal->stateStartTime = currentTime;
                PWM_SetPulseWidth(cal->lowPulse);
            }
            break;
            
        case ESC_CAL_LOW_PULSE:
            if (elapsedTime >= ESC_CAL_LOW_PULSE_TIME_MS)
            {
                cal->state = ESC_CAL_COMPLETED;
                cal->calibrationComplete = true;
                
                motor->minPulse = cal->lowPulse;
                motor->maxPulse = cal->highPulse;
                motor->isCalibrated = true;
                
                PWM_SetPulseWidth(PWM_MIN_PULSE);
            }
            break;
            
        case ESC_CAL_COMPLETED:
            return ESC_CAL_OK;
            
        case ESC_CAL_FAILED:
            return ESC_CAL_ERROR;
            
        default:
            cal->state = ESC_CAL_FAILED;
            return ESC_CAL_ERROR;
    }
    
    return ESC_CAL_IN_PROGRESS;
}

ESC_CalStatus_t ESC_GetCalibrationStatus(ESC_Calibration_t *cal)
{
    if (cal == NULL)
    {
        return ESC_CAL_ERROR;
    }
    
    switch (cal->state)
    {
        case ESC_CAL_COMPLETED:
            return ESC_CAL_OK;
            
        case ESC_CAL_FAILED:
            return ESC_CAL_ERROR;
            
        case ESC_CAL_IDLE:
        case ESC_CAL_INIT:
        case ESC_CAL_HIGH_PULSE:
        case ESC_CAL_LOW_PULSE:
            return ESC_CAL_IN_PROGRESS;
            
        default:
            return ESC_CAL_ERROR;
    }
}

bool ESC_IsCalibrationComplete(ESC_Calibration_t *cal)
{
    if (cal == NULL)
    {
        return false;
    }
    
    return cal->calibrationComplete;
}

void ESC_AbortCalibration(ESC_Calibration_t *cal)
{
    if (cal == NULL)
    {
        return;
    }
    
    cal->state = ESC_CAL_FAILED;
    cal->calibrationComplete = false;
    PWM_SetPulseWidth(PWM_MIN_PULSE);
}

ESC_CalStatus_t ESC_GetCalibrationValues(ESC_Calibration_t *cal, uint16_t *minPulse, uint16_t *maxPulse)
{
    if (cal == NULL || minPulse == NULL || maxPulse == NULL)
    {
        return ESC_CAL_ERROR;
    }
    
    if (!cal->calibrationComplete)
    {
        return ESC_CAL_IN_PROGRESS;
    }
    
    *minPulse = cal->lowPulse;
    *maxPulse = cal->highPulse;
    
    return ESC_CAL_OK;
}