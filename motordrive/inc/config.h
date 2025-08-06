#ifndef CONFIG_H
#define CONFIG_H

#define CONTROL_LOOP_FREQ_HZ        100
#define PID_UPDATE_RATE_HZ          100

#define PID_KP                      1.0f
#define PID_KI                      0.1f
#define PID_KD                      0.01f

#define MOTOR_ACCELERATION_RATE     50.0f

#define CAN_RX_BUFFER_SIZE          16

#define USE_FULL_ASSERT

#ifdef USE_FULL_ASSERT
#define assert_param(expr) ((expr) ? (void)0U : assert_failed((uint8_t *)__FILE__, __LINE__))
void assert_failed(uint8_t* file, uint32_t line);
#else
#define assert_param(expr) ((void)0U)
#endif

#endif