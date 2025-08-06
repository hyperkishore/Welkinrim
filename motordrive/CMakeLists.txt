cmake_minimum_required(VERSION 3.16)

project(drone-motordrive C ASM)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(MCU_FAMILY STM32F4xx)
set(MCU_MODEL STM32F407xx)

set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_VERSION 1)
set(CMAKE_SYSTEM_PROCESSOR arm)

set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_ASM_COMPILER arm-none-eabi-gcc)
set(CMAKE_AR arm-none-eabi-ar)
set(CMAKE_OBJCOPY arm-none-eabi-objcopy)
set(CMAKE_OBJDUMP arm-none-eabi-objdump)
set(SIZE arm-none-eabi-size)

set(CMAKE_EXECUTABLE_SUFFIX_ASM ".elf")
set(CMAKE_EXECUTABLE_SUFFIX_C ".elf")
set(CMAKE_EXECUTABLE_SUFFIX_CXX ".elf")

set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

set(MCPU cortex-m4)

set(MFPU fpv4-sp-d16)
set(MFLOAT_ABI hard)

set(CMAKE_C_FLAGS "-mcpu=${MCPU} -std=gnu11 -g3 -DDEBUG -DUSE_HAL_DRIVER -D${MCU_MODEL} -c -O0 -ffunction-sections -fdata-sections -Wall -fstack-usage --specs=nano.specs -mfpu=${MFPU} -mfloat-abi=${MFLOAT_ABI} -mthumb")
set(CMAKE_ASM_FLAGS "-mcpu=${MCPU} -g3 -DDEBUG -c -x assembler-with-cpp --specs=nano.specs -mfpu=${MFPU} -mfloat-abi=${MFLOAT_ABI} -mthumb")
set(CMAKE_EXE_LINKER_FLAGS "-mcpu=${MCPU} -T${CMAKE_SOURCE_DIR}/STM32F407VGTx_FLASH.ld --specs=nosys.specs -Wl,-Map=${PROJECT_NAME}.map -Wl,--gc-sections -static --specs=nano.specs -mfpu=${MFPU} -mfloat-abi=${MFLOAT_ABI} -mthumb -Wl,--start-group -lc -lm -Wl,--end-group")

include_directories(inc)
include_directories(Drivers/STM32F4xx_HAL_Driver/Inc)
include_directories(Drivers/STM32F4xx_HAL_Driver/Inc/Legacy)
include_directories(Drivers/CMSIS/Device/ST/STM32F4xx/Include)
include_directories(Drivers/CMSIS/Include)

file(GLOB_RECURSE SOURCES 
    "src/*.*"
    "Drivers/STM32F4xx_HAL_Driver/Src/*.*"
    "startup_stm32f407xx.s"
    "system_stm32f4xx.c"
)

add_executable(${PROJECT_NAME}.elf ${SOURCES})

set(HEX_FILE ${PROJECT_BINARY_DIR}/${PROJECT_NAME}.hex)
set(BIN_FILE ${PROJECT_BINARY_DIR}/${PROJECT_NAME}.bin)

add_custom_command(TARGET ${PROJECT_NAME}.elf POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -Oihex $<TARGET_FILE:${PROJECT_NAME}.elf> ${HEX_FILE}
    COMMAND ${CMAKE_OBJCOPY} -Obinary $<TARGET_FILE:${PROJECT_NAME}.elf> ${BIN_FILE}
    COMMENT "Building ${HEX_FILE}
Building ${BIN_FILE}")

add_custom_target(flash
    COMMAND st-flash write ${BIN_FILE} 0x8000000
    DEPENDS ${PROJECT_NAME}.elf
    COMMENT "Flashing the target")