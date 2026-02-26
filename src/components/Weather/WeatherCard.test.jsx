import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from './WeatherCard';

describe('WeatherCard', () => {
  const mockWeather = {
    temperature: 28,
    feelsLike: 30,
    description: 'partly cloudy',
    condition: 'partly cloudy',
    icon: '02d',
    windSpeed: 12,
    windDirection: 'NE',
    humidity: 75,
    pressure: 1013,
    visibility: 10000,
  };

  it('renders municipality name', () => {
    render(<WeatherCard municipality="Daet" weather={null} />);
    expect(screen.getByText('Daet')).toBeInTheDocument();
  });

  it('shows unavailable message when weather is null', () => {
    render(<WeatherCard municipality="Daet" weather={null} />);
    expect(screen.getByText('Weather data unavailable')).toBeInTheDocument();
  });

  it('renders compact version when compact prop is true', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} compact={true} />);

    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('Daet')).toBeInTheDocument();
  });

  it('renders full version when compact is false', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} compact={false} />);

    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('Daet')).toBeInTheDocument();
    expect(screen.getByText(/partly cloudy/i)).toBeInTheDocument();
    expect(screen.getByText(/wind/i)).toBeInTheDocument();
    expect(screen.getByText(/humidity/i)).toBeInTheDocument();
  });

  it('displays feels like temperature when available', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} />);
    expect(screen.getByText(/feels like 30/i)).toBeInTheDocument();
  });

  it('displays humidity percentage', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays pressure in hPa', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} />);
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
  });

  it('displays visibility in km', () => {
    render(<WeatherCard municipality="Daet" weather={mockWeather} />);
    expect(screen.getByText('10.0 km')).toBeInTheDocument();
  });

  it('handles description and condition fallback', () => {
    const weatherNoDesc = { ...mockWeather, description: null };
    render(<WeatherCard municipality="Daet" weather={weatherNoDesc} />);
    expect(screen.getByText(/partly cloudy/i)).toBeInTheDocument();
  });

  it('handles null visibility', () => {
    const weatherNoVis = { ...mockWeather, visibility: null };
    render(<WeatherCard municipality="Daet" weather={weatherNoVis} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('does not show feels like when not available', () => {
    const weatherNoFeels = { ...mockWeather, feelsLike: null };
    render(<WeatherCard municipality="Daet" weather={weatherNoFeels} />);
    expect(screen.queryByText(/feels like/i)).not.toBeInTheDocument();
  });

  it('renders weather icon', () => {
    const { container } = render(<WeatherCard municipality="Daet" weather={mockWeather} />);
    const icon = container.querySelector('.text-3xl');
    expect(icon).toBeInTheDocument();
  });
});
