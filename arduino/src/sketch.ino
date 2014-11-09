const int sensorPin = A0;
const int LED = 12;

void setup()
{
    Serial.begin(9600);
    pinMode(LED, OUTPUT);
}

void loop()
{
    // function prototype
    float convertReadingToTemp(int reading);

    // read in the temperature raw data reading
    int reading = analogRead(sensorPin);

    Serial.println(convertReadingToTemp(reading));

    // ------------------------------

    while(Serial.available())
    {
        char inputData = Serial.read(); // read in a single character
        if(inputData == 'H')
        {
            digitalWrite(LED, HIGH);
        }
        else if(inputData == 'L')
        {
            digitalWrite(LED, LOW);
        }
    }

    delay(1000);
}

// Converts the reading to temperatures in Celcius
float convertReadingToTemp(int reading) {
    float voltage = reading * 5.0;
    voltage /= 1024.0;
    return ((voltage - 0.5) * 100);
}
