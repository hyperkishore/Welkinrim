#ifndef ESC_CALIBRATION_H
#define ESC_CALIBRATION_H

#include "stm32f4xx_hal.h"
#include "motor_control.h"
#include <stdint.h>
#include <stdbool.h>

typedef enum {
    ESC_CAL_IDLE = 0,
    ESC_CAL_INIT,
    ESC_CAL_HIGH_PULSE,
    ESC_CAL_LOW_PULSE,
    ESC_CAL_COMPLETED,
    ESC_CAL_FAILED
} ESC_CalibrationState_t;

typedef struct {
    ESC_CalibrationState_t state;
    uint32_t stateStartTime;
    uint16_t highPulse;
    uint16_t lowPulse;
    bool calibrationComplete;
    uint32_t timeoutMs;
} ESC_Calibration_t;

typedef enum {
    ESC_CAL_OK = 0,
    ESC_CAL_ERROR,
    ESC_CAL_TIMEOUT,
    ESC_CAL_IN_PROGRESS
} ESC_CalStatus_t;

ESC_CalStatus_t ESC_StartCalibration(ESC_Calibration_t *cal, uint32_t timeoutMs);
ESC_CalStatus_t ESC_UpdateCalibration(ESC_Calibration_t *cal, MotorControl_t *motor);
ESC_CalStatus_t ESC_GetCalibrationStatus(ESC_Calibration_t *cal);
bool ESC_IsCalibrationComplete(ESC_Calibration_t *cal);
void ESC_AbortCalibration(ESC_Calibration_t *cal);
ESC_CalStatus_t ESC_GetCalibrationValues(ESC_Calibration_t *cal, uint16_t *minPulse, uint16_t *maxPulse);

#endif