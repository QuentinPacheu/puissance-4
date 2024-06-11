#include <BleGamepad.h>

const int buttonPin = 25;          // Pin where the button is connected
const int joystickXPin = 34;       // Pin where the joystick X-axis is connected
const int joystickYPin = 35;       // Pin where the joystick Y-axis is connected
const int joystickButtonPin = 26;   // Pin where the joystick button is connected

BleGamepad bleGamepad("MyESP32Gamepad", "ESP32 Manufacturer", 100);

void setup() {
  Serial.begin(115200);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(joystickButtonPin, INPUT_PULLUP);
  bleGamepad.begin();
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == LOW) {
    bleGamepad.press(BUTTON_1);
    while (digitalRead(buttonPin) == LOW);
    bleGamepad.release(BUTTON_1);
  }

  int joystickButtonState = digitalRead(joystickButtonPin);
  if (joystickButtonState == LOW) {
    bleGamepad.press(BUTTON_2);
    while (digitalRead(joystickButtonPin) == LOW);
    bleGamepad.release(BUTTON_2);
  }

  int joystickXValue = analogRead(joystickXPin);
  int joystickYValue = analogRead(joystickYPin);

  // Map analog values to the range 0-255
  int mappedJoystickX = map(joystickXValue, 0, 4095, 0, 255);
  int mappedJoystickY = map(joystickYValue, 0, 4095, 0, 255);

  // Print the analog joystick values for debugging
  Serial.print("Joystick X Analog Value: ");
  Serial.println(joystickXValue);
  Serial.print("Joystick Y Analog Value: ");
  Serial.println(joystickYValue);

  // Print the mapped joystick values for debugging
  Serial.print("Mapped Joystick X: ");
  Serial.print(mappedJoystickX);
  Serial.print(" | Mapped Joystick Y: ");
  Serial.println(mappedJoystickY);

  // Send the mapped joystick values
  bleGamepad.setLeftThumb(mappedJoystickX, mappedJoystickY);

  delay(100);
}
