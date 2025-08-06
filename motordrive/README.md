# Drone Motor Drive Controller

A complete motor drive system for BLDC motors in drone applications using STM32F4 microcontroller.

## Features

- **BLDC Motor Control**: PWM-based ESC control with calibration
- **Pixhawk Integration**: PWM signal input from flight controller
- **CAN Communication**: Status reporting and command interface
- **PID Control**: Closed-loop speed control with anti-windup
- **Real-time Operation**: 100Hz control loop

## Hardware Requirements

- STM32F407 microcontroller
- BLDC motor with ESC
- CAN transceiver
- Pixhawk flight controller

## Pin Configuration

- **PWM Output**: PC6 (TIM3_CH1) - ESC control
- **Pixhawk Input**: PB7 (TIM4_CH2) - Throttle signal
- **CAN**: PD0 (CAN_RX), PD1 (CAN_TX)

## Software Architecture

### Core Modules

1. **Motor Control** (`motor_control.h/c`)
   - Motor state management
   - Speed control interface
   - Acceleration limiting

2. **PWM Control** (`pwm_control.h/c`)
   - Hardware PWM generation
   - Pulse width control (1000-2000μs)
   - 50Hz ESC compatibility

3. **PID Controller** (`pid_controller.h/c`)
   - Proportional-Integral-Derivative control
   - Anti-windup protection
   - Configurable gains

4. **Pixhawk Interface** (`pixhawk_interface.h/c`)
   - PWM signal capture
   - Throttle command processing
   - Signal validation

5. **CAN Interface** (`can_interface.h/c`)
   - Motor status transmission
   - Command reception
   - Message buffering

6. **ESC Calibration** (`esc_calibration.h/c`)
   - Automatic ESC calibration
   - High/low pulse training
   - Timeout protection

## Configuration

Key parameters in `config.h`:

```c
#define CONTROL_LOOP_FREQ_HZ    100     // Main control frequency
#define PID_KP                  1.0f    // Proportional gain
#define PID_KI                  0.1f    // Integral gain
#define PID_KD                  0.01f   // Derivative gain
#define MOTOR_ACCELERATION_RATE 50.0f   // Max acceleration
```

## Build Instructions

1. Install ARM GCC toolchain
2. Configure STM32 HAL drivers path
3. Build with CMake:

```bash
mkdir build
cd build
cmake ..
make
```

## CAN Protocol

### Motor Status (ID: 0x100)
- Bytes 0-3: Motor speed (float)
- Bytes 4-7: Duty cycle (float)

### Motor Command (ID: 0x101)
- Bytes 0-3: Target speed (float)
- Byte 4: Command type

### Error Reports (ID: 0x103)
- Bytes 0-3: Error code (uint32)

## Safety Features

- Signal timeout detection
- PWM output limiting
- Motor state monitoring
- Emergency stop capability

## Usage Example

```c
MotorControl_t motor;
PIDController_t speedPID;

// Initialize systems
MotorControl_Init(&motor);
PID_Init(&speedPID, 1.0f, 0.1f, 0.01f, 100.0f);

// Calibrate ESC
MotorControl_Calibrate(&motor);

// Control loop
while(1) {
    float targetSpeed = Pixhawk_GetThrottleCommand();
    float controlOutput = PID_Update(&speedPID, targetSpeed, motor.currentSpeed);
    MotorControl_SetSpeed(&motor, controlOutput);
    HAL_Delay(10);
}
```