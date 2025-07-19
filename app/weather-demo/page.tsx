import WeatherForecast from '../components/WeatherForecast';

export default function WeatherDemoPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">날씨 예보 데모</h1>
      
      <div className="max-w-md mx-auto">
        <WeatherForecast
          temperature={-12}
          emotion="슬픈"
          timeSlot="오전"
        />
      </div>
    </div>
  );
} 