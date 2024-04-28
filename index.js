import express from 'express';
import axios from 'axios';
import { config } from 'dotenv';
import fs from 'fs';
config();

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', async (req, res) => {
  try {
    const response = await axios.get('');
    const data = response.data.feeds;

    // Calculate average of each gas for each date
    const averages = {};
    data.forEach(feed => {
      const date = feed.created_at.split(' ')[0];
      if (!averages[date]) {
        averages[date] = {
          date: date,
          LPG: [],
          CO2: [],
          Alcohol: [],
          Smoke: []
        };
      }
      averages[date].LPG.push(parseFloat(feed.field1));
      averages[date].CO2.push(parseFloat(feed.field2));
      averages[date].Alcohol.push(parseFloat(feed.field3));
      averages[date].Smoke.push(parseFloat(feed.field4));
    });

    // Calculate the mean for each gas for each date
    for (const date in averages) {
      averages[date].LPG = averages[date].LPG.reduce((a, b) => a + b, 0) / averages[date].LPG.length;
      averages[date].CO2 = averages[date].CO2.reduce((a, b) => a + b, 0) / averages[date].CO2.length;
      averages[date].Alcohol = averages[date].Alcohol.reduce((a, b) => a + b, 0) / averages[date].Alcohol.length;
      averages[date].Smoke = averages[date].Smoke.reduce((a, b) => a + b, 0) / averages[date].Smoke.length;
    }

    // Format the data for display in the table
    const textData = Object.values(averages).map(average => `${average.date}\t${average.LPG}\t${average.CO2}\t${average.Alcohol}\t${average.Smoke}`).join('\n');

    fs.writeFileSync('data.txt', `Date\tLPG (PPM)\tCO2 (PPM)\tAlcohol (PPM)\tSmoke (PPM)\n${textData}`);

    const lpgData = data.map(feed => ({ x: feed.created_at, y: feed.LPG }));
    const co2Data = data.map(feed => ({ x: feed.created_at, y: feed.CO2 }));
    const alcoholData = data.map(feed => ({ x: feed.created_at, y: feed.Alcohol }));
    const smokeData = data.map(feed => ({ x: feed.created_at, y: feed.Smoke }));

    res.render('index', { lpgData, co2Data, alcoholData, smokeData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/download', (req, res) => {
  try {
    // Read the text file and send it as a response
    const data = fs.readFileSync('data.txt', 'utf8');
    res.set('Content-Type', 'text/plain');
    res.set('Content-Disposition', 'attachment; filename=data.txt');
    res.send(data);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Internal Server Error');
  }
});








app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
