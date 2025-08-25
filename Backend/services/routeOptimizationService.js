const axios = require('axios');

class RouteOptimizationService {
  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate multiple route options with safety scoring
  static async generateRouteOptions(startLocation, endLocation, options = {}) {
    const { 
      avoidWeather = true, 
      prioritizeSafety = true, 
      maxAltitude = 120, // meters
      emergencyMode = false 
    } = options;

    // Primary direct route
    const directRoute = this.generateDirectRoute(startLocation, endLocation);
    
    // Alternative routes with different waypoints
    const alternativeRoutes = this.generateAlternativeRoutes(startLocation, endLocation);
    
    // Weather-aware routing (simplified - in production, integrate with weather API)
    const weatherOptimizedRoute = await this.generateWeatherOptimizedRoute(
      startLocation, 
      endLocation, 
      avoidWeather
    );

    const routes = [
      { ...directRoute, routeId: 'direct', type: 'direct' },
      ...alternativeRoutes,
      { ...weatherOptimizedRoute, routeId: 'weather-optimized', type: 'weather-optimized' }
    ];

    // Score each route based on multiple factors
    return routes.map(route => ({
      ...route,
      safetyScore: this.calculateSafetyScore(route, emergencyMode),
      riskFactors: this.identifyRiskFactors(route)
    })).sort((a, b) => {
      if (emergencyMode) {
        // For emergency, prioritize speed over safety (but still consider safety)
        return (b.safetyScore * 0.3 + (100 - b.estimatedTime) * 0.7) - 
               (a.safetyScore * 0.3 + (100 - a.estimatedTime) * 0.7);
      }
      return b.safetyScore - a.safetyScore;
    });
  }

  // Generate direct route between two points
  static generateDirectRoute(start, end) {
    const distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const estimatedTime = (distance / 50) * 60; // Assume 50 km/h, convert to minutes
    
    return {
      waypoints: [
        { lat: start.lat, lng: start.lng, altitude: 50, waypoint: 'start' },
        { lat: end.lat, lng: end.lng, altitude: 50, waypoint: 'end' }
      ],
      distance,
      estimatedTime,
      fuelConsumption: distance * 0.1, // Simplified fuel calculation
      difficulty: 'easy'
    };
  }

  // Generate alternative routes with intermediate waypoints
  static generateAlternativeRoutes(start, end) {
    const routes = [];
    
    // Route 1: Northern arc
    const northWaypoint = {
      lat: (start.lat + end.lat) / 2 + 0.01,
      lng: (start.lng + end.lng) / 2,
      altitude: 60
    };
    
    const northRoute = this.createRouteWithWaypoint(start, end, northWaypoint, 'northern-arc');
    routes.push(northRoute);

    // Route 2: Southern arc
    const southWaypoint = {
      lat: (start.lat + end.lat) / 2 - 0.01,
      lng: (start.lng + end.lng) / 2,
      altitude: 60
    };
    
    const southRoute = this.createRouteWithWaypoint(start, end, southWaypoint, 'southern-arc');
    routes.push(southRoute);

    // Route 3: High altitude route (for obstacle avoidance)
    const highAltRoute = {
      ...this.generateDirectRoute(start, end),
      routeId: 'high-altitude',
      type: 'high-altitude',
      waypoints: [
        { lat: start.lat, lng: start.lng, altitude: 100, waypoint: 'start' },
        { lat: end.lat, lng: end.lng, altitude: 100, waypoint: 'end' }
      ]
    };
    routes.push(highAltRoute);

    return routes;
  }

  // Create route with intermediate waypoint
  static createRouteWithWaypoint(start, end, waypoint, routeId) {
    const dist1 = this.calculateDistance(start.lat, start.lng, waypoint.lat, waypoint.lng);
    const dist2 = this.calculateDistance(waypoint.lat, waypoint.lng, end.lat, end.lng);
    const totalDistance = dist1 + dist2;
    const estimatedTime = (totalDistance / 50) * 60;

    return {
      routeId,
      type: 'alternative',
      waypoints: [
        { lat: start.lat, lng: start.lng, altitude: 50, waypoint: 'start' },
        { ...waypoint, waypoint: 'intermediate' },
        { lat: end.lat, lng: end.lng, altitude: 50, waypoint: 'end' }
      ],
      distance: totalDistance,
      estimatedTime,
      fuelConsumption: totalDistance * 0.12, // Slightly higher for longer route
      difficulty: 'medium'
    };
  }

  // Generate weather-optimized route (simplified)
  static async generateWeatherOptimizedRoute(start, end, avoidWeather) {
    // In production, integrate with weather APIs like OpenWeatherMap
    const baseRoute = this.generateDirectRoute(start, end);
    
    if (!avoidWeather) {
      return { ...baseRoute, type: 'weather-optimized' };
    }

    // Simulate weather avoidance by adding slight detour
    const weatherWaypoint = {
      lat: (start.lat + end.lat) / 2 + 0.005,
      lng: (start.lng + end.lng) / 2 + 0.005,
      altitude: 70
    };

    return {
      ...this.createRouteWithWaypoint(start, end, weatherWaypoint, 'weather-optimized'),
      weatherConditions: {
        windSpeed: 15, // km/h
        visibility: 'good',
        precipitation: 'none',
        turbulence: 'low'
      }
    };
  }

  // Calculate safety score for a route
  static calculateSafetyScore(route, emergencyMode = false) {
    let score = 100;
    
    // Distance factor (shorter is safer)
    if (route.distance > 50) score -= 10;
    if (route.distance > 100) score -= 20;
    
    // Altitude factor
    const avgAltitude = route.waypoints.reduce((sum, wp) => sum + (wp.altitude || 50), 0) / route.waypoints.length;
    if (avgAltitude > 80) score -= 5;
    if (avgAltitude > 100) score -= 10;
    
    // Route complexity
    if (route.waypoints.length > 3) score -= 5;
    if (route.difficulty === 'hard') score -= 15;
    if (route.difficulty === 'medium') score -= 5;
    
    // Weather conditions
    if (route.weatherConditions) {
      if (route.weatherConditions.windSpeed > 20) score -= 10;
      if (route.weatherConditions.visibility === 'poor') score -= 20;
      if (route.weatherConditions.precipitation !== 'none') score -= 15;
    }
    
    // Emergency mode adjustments
    if (emergencyMode) {
      // Prioritize speed over some safety factors
      if (route.type === 'direct') score += 10;
      if (route.estimatedTime < 30) score += 15; // Under 30 minutes
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Identify potential risk factors for a route
  static identifyRiskFactors(route) {
    const risks = [];
    
    if (route.distance > 100) {
      risks.push({ type: 'long_distance', severity: 'medium', description: 'Long distance flight increases battery risk' });
    }
    
    const maxAltitude = Math.max(...route.waypoints.map(wp => wp.altitude || 50));
    if (maxAltitude > 100) {
      risks.push({ type: 'high_altitude', severity: 'low', description: 'High altitude flight' });
    }
    
    if (route.waypoints.length > 4) {
      risks.push({ type: 'complex_route', severity: 'low', description: 'Multiple waypoints increase navigation complexity' });
    }
    
    if (route.weatherConditions?.windSpeed > 25) {
      risks.push({ type: 'high_wind', severity: 'high', description: 'High wind speeds detected' });
    }
    
    if (route.weatherConditions?.precipitation !== 'none') {
      risks.push({ type: 'precipitation', severity: 'medium', description: 'Precipitation along route' });
    }
    
    return risks;
  }

  // Real-time route adjustment based on current conditions
  static async adjustRouteRealTime(currentRoute, droneLocation, targetLocation, conditions = {}) {
    const { batteryLevel, weatherUpdate, obstacleDetected, emergencyMode } = conditions;
    
    let adjustedRoute = { ...currentRoute };
    let adjustmentsMade = [];
    
    // Battery-based adjustments
    if (batteryLevel < 30) {
      // Find shortest route to destination
      const directRoute = this.generateDirectRoute(droneLocation, targetLocation);
      if (directRoute.distance < currentRoute.distance) {
        adjustedRoute = directRoute;
        adjustmentsMade.push('Switched to direct route due to low battery');
      }
    }
    
    // Weather-based adjustments
    if (weatherUpdate?.windSpeed > 30) {
      // Lower altitude to avoid high winds
      adjustedRoute.waypoints = adjustedRoute.waypoints.map(wp => ({
        ...wp,
        altitude: Math.max(30, wp.altitude - 20)
      }));
      adjustmentsMade.push('Reduced altitude due to high winds');
    }
    
    // Obstacle avoidance
    if (obstacleDetected) {
      // Generate alternative route avoiding obstacle area
      const alternativeRoutes = this.generateAlternativeRoutes(droneLocation, targetLocation);
      const bestAlternative = alternativeRoutes.find(route => 
        this.calculateSafetyScore(route, emergencyMode) > 80
      );
      
      if (bestAlternative) {
        adjustedRoute = bestAlternative;
        adjustmentsMade.push('Route changed to avoid detected obstacle');
      }
    }
    
    return {
      adjustedRoute,
      adjustmentsMade,
      timestamp: new Date(),
      originalRoute: currentRoute
    };
  }

  // Calculate estimated time of arrival with real-time factors
  static calculateETA(route, droneSpeed = 50, currentConditions = {}) {
    const { windSpeed = 0, windDirection = 0, droneHeading = 0 } = currentConditions;
    
    // Adjust speed based on wind conditions
    const windEffect = windSpeed * Math.cos((windDirection - droneHeading) * Math.PI / 180);
    const effectiveSpeed = Math.max(20, droneSpeed + windEffect); // Minimum 20 km/h
    
    const totalDistance = route.distance;
    const estimatedTimeHours = totalDistance / effectiveSpeed;
    const estimatedTimeMinutes = estimatedTimeHours * 60;
    
    return {
      eta: new Date(Date.now() + estimatedTimeMinutes * 60000),
      estimatedTimeMinutes: Math.round(estimatedTimeMinutes),
      effectiveSpeed,
      windEffect: windEffect > 0 ? 'tailwind' : 'headwind'
    };
  }
}

module.exports = RouteOptimizationService;
