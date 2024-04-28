#include <ThingSpeak.h> // Include the ThingSpeak library
#include <ESP8266WiFi.h>

// WiFi settings
const char* ssid = "";
const char* password = "";

#define GAS_SENSOR A0 // Analog pin connected to the MQ2 sensor
#define GAS_SAMPLE_INTERVAL 2000 // Interval in milliseconds to sample the gas sensor

// ThingSpeak settings
unsigned long channelID = 2525394; // Your ThingSpeak channel ID
const char* writeAPIKey = "IENBCE4CN2YG6RJN"; // Your ThingSpeak write API key

WiFiClient client;

void setup() {
  Serial.begin(9600); // Start serial communication
  connectWiFi(); // Connect to WiFi
  ThingSpeak.begin(client); // Initialize ThingSpeak
}

void loop() {
  int sensorValue = analogRead(GAS_SENSOR); // Read analog value from the sensor
  float voltage = sensorValue * (5.0 / 1023.0); // Convert analog value to voltage
  float lpgConcentration = getGasConcentration(voltage, -0.2, 0.5); // Calculate LPG concentration
  float co2Concentration = getGasConcentration(voltage, -0.4, 1.0); // Calculate CO2 concentration
  float alcoholConcentration = getGasConcentration(voltage, -0.3, 0.7); // Calculate alcohol concentration
  float smokeConcentration = getGasConcentration(voltage, -0.5, 1.2); // Calculate smoke concentration

  Serial.print("LPG Concentration: ");
  Serial.print(lpgConcentration);
  Serial.println(" ppm");

  Serial.print("CO2 Concentration: ");
  Serial.print(co2Concentration);
  Serial.println(" ppm");

  Serial.print("Alcohol Concentration: ");
  Serial.print(alcoholConcentration);
  Serial.println(" ppm");

  Serial.print("Smoke Concentration: ");
  Serial.print(smokeConcentration);
  Serial.println(" ppm");

  // Update ThingSpeak channel with gas concentrations
  ThingSpeak.setField(1, lpgConcentration);
  ThingSpeak.setField(2, co2Concentration);
  ThingSpeak.setField(3, alcoholConcentration);
  ThingSpeak.setField(4, smokeConcentration);
  ThingSpeak.writeFields(channelID, writeAPIKey);

  delay(GAS_SAMPLE_INTERVAL); // Wait for the next sample interval
}

float getGasConcentration(float voltage, float slope, float intercept) {
  // Calculate gas concentration using the calibration curve
  float concentration = slope * voltage + intercept;

  return concentration;
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting...");
  }
  Serial.println("Connected to WiFi");
}

