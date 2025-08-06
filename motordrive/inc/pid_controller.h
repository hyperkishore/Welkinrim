#ifndef PID_CONTROLLER_H
#define PID_CONTROLLER_H

#include <stdint.h>
#include <stdbool.h>

typedef struct {
    float kp;
    float ki;
    float kd;
    
    float previousError;
    float integral;
    float derivative;
    
    float outputMin;
    float outputMax;
    
    float setpoint;
    float output;
    
    uint32_t lastUpdateTime;
    float sampleTime;
    
    bool antiWindup;
    float integralMax;
    
} PIDController_t;

typedef enum {
    PID_OK = 0,
    PID_ERROR,
    PID_INVALID_PARAM
} PID_Status_t;

PID_Status_t PID_Init(PIDController_t *pid, float kp, float ki, float kd, float sampleRate);
PID_Status_t PID_SetTunings(PIDController_t *pid, float kp, float ki, float kd);
PID_Status_t PID_SetOutputLimits(PIDController_t *pid, float min, float max);
PID_Status_t PID_SetSampleTime(PIDController_t *pid, float sampleTime);
PID_Status_t PID_SetAntiWindup(PIDController_t *pid, bool enable, float maxIntegral);
float PID_Update(PIDController_t *pid, float setpoint, float input);
void PID_Reset(PIDController_t *pid);
float PID_GetOutput(PIDController_t *pid);
float PID_GetError(PIDController_t *pid);

#endif