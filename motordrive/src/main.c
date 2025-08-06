#include "stm32f4xx_hal.h"
#include "motor_control.h"
#include "pwm_control.h"
#include "can_interface.h"
#include "pid_controller.h"
#include "pixhawk_interface.h"
#include "config.h"

static void SystemClock_Config(void);
static void Error_Handler(void);

MotorControl_t motor;
PIDController_t speedPID;

int main(void)
{
    HAL_Init();
    SystemClock_Config();
    
    PWM_Init();
    CAN_Init();
    Pixhawk_Init();
    
    PID_Init(&speedPID, PID_KP, PID_KI, PID_KD, PID_UPDATE_RATE_HZ);
    speedPID.outputMin = 0.0f;
    speedPID.outputMax = 100.0f;
    
    MotorControl_Init(&motor);
    
    uint32_t lastUpdateTime = HAL_GetTick();
    
    while (1)
    {
        uint32_t currentTime = HAL_GetTick();
        
        if ((currentTime - lastUpdateTime) >= (1000 / CONTROL_LOOP_FREQ_HZ))
        {
            lastUpdateTime = currentTime;
            
            float targetSpeed = Pixhawk_GetThrottleCommand();
            
            float controlOutput = PID_Update(&speedPID, targetSpeed, motor.currentSpeed);
            
            MotorControl_SetSpeed(&motor, controlOutput);
            
            CAN_SendMotorStatus(motor.currentSpeed, motor.dutyCycle);
        }
        
        CAN_ProcessMessages();
        Pixhawk_ProcessCommands();
    }
}

static void SystemClock_Config(void)
{
    RCC_OscInitTypeDef RCC_OscInitStruct = {0};
    RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};
    
    __HAL_RCC_PWR_CLK_ENABLE();
    __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);
    
    RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
    RCC_OscInitStruct.HSEState = RCC_HSE_ON;
    RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
    RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
    RCC_OscInitStruct.PLL.PLLM = 8;
    RCC_OscInitStruct.PLL.PLLN = 336;
    RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
    RCC_OscInitStruct.PLL.PLLQ = 7;
    
    if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
    {
        Error_Handler();
    }
    
    RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_SYSCLK
                                | RCC_CLOCKTYPE_PCLK1 | RCC_CLOCKTYPE_PCLK2;
    RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
    RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
    RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV4;
    RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV2;
    
    if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_5) != HAL_OK)
    {
        Error_Handler();
    }
}

static void Error_Handler(void)
{
    __disable_irq();
    while (1)
    {
    }
}

#ifdef USE_FULL_ASSERT
void assert_failed(uint8_t *file, uint32_t line)
{
    
}
#endif