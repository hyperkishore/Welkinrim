#ifndef PIXHAWK_INTERFACE_H
#define PIXHAWK_INTERFACE_H

#include "stm32f4xx_hal.h"
#include <stdint.h>
#include <stdbool.h>

#define PIXHAWK_PWM_MIN         1000
#define PIXHAWK_PWM_MAX         2000
#define PIXHAWK_PWM_NEUTRAL     1500

#define PIXHAWK_TIMEOUT_MS      100

typedef enum {
    PIXHAWK_OK = 0,
    PIXHAWK_ERROR,
    PIXHAWK_TIMEOUT,
    PIXHAWK_INVALID_SIGNAL
} Pixhawk_Status_t;

typedef enum {
    PIXHAWK_DISCONNECTED = 0,
    PIXHAWK_CONNECTED,
    PIXHAWK_SIGNAL_LOST
} Pixhawk_State_t;

typedef struct {
    uint16_t throttlePulse;
    float throttlePercent;
    uint32_t lastSignalTime;
    Pixhawk_State_t state;
    bool signalValid;
} Pixhawk_Handle_t;

Pixhawk_Status_t Pixhawk_Init(void);
float Pixhawk_GetThrottleCommand(void);
uint16_t Pixhawk_GetThrottlePulse(void);
Pixhawk_State_t Pixhawk_GetState(void);
bool Pixhawk_IsSignalValid(void);
void Pixhawk_ProcessCommands(void);
void Pixhawk_Update(void);

#endif