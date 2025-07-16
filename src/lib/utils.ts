///Users/raghavtripathi/Projects 2.0/session-scribe-log/src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category, SessionType, Session } from "@/types/session"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Unit-aware utility functions for handling mixed units within categories
export interface UnitInfo {
  unit: string;
  conversionToBase: number; // Factor to convert to base unit (g for weed)
  displayDecimals: number;
}

export const getSessionUnitInfo = (category: Category, sessionType: SessionType): UnitInfo => {
  switch (category) {
    case 'weed':
      switch (sessionType) {
        case 'Joint':
        case 'Bong':
        case 'Vape':
        case 'Other':
          return { unit: 'g', conversionToBase: 1, displayDecimals: 2 };
        case 'Edible':
          return { unit: 'mg', conversionToBase: 0.001, displayDecimals: 1 }; // 1mg = 0.001g
        default:
          return { unit: 'g', conversionToBase: 1, displayDecimals: 2 };
      }
    case 'cigs':
      return { unit: 'cigs', conversionToBase: 1, displayDecimals: 0 };
    case 'vapes':
      return { unit: 'puffs', conversionToBase: 1, displayDecimals: 0 };
    case 'liquor':
      return { unit: 'ml', conversionToBase: 1, displayDecimals: 0 };
    default:
      return { unit: 'units', conversionToBase: 1, displayDecimals: 0 };
  }
};

export const getCategoryBaseUnit = (category: Category): string => {
  switch (category) {
    case 'weed': return 'g';
    case 'cigs': return 'cigs';
    case 'vapes': return 'puffs';
    case 'liquor': return 'ml';
    default: return 'units';
  }
};

// Get individual consumption normalized to base unit for calculations
export const getNormalizedIndividualConsumption = (session: Session): number => {
  const { conversionToBase } = getSessionUnitInfo(session.category, session.session_type);
  
  if (session.category === 'liquor') {
    const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
    return session.quantity * mlPerServing;
  } else {
    return (session.quantity / session.participant_count) * conversionToBase;
  }
};

// Get individual consumption with original unit for display
export const getIndividualConsumptionWithUnit = (session: Session): { value: number; unit: string } => {
  const unitInfo = getSessionUnitInfo(session.category, session.session_type);
  
  if (session.category === 'liquor') {
    const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
    return { 
      value: session.quantity * mlPerServing, 
      unit: 'ml' 
    };
  } else {
    return { 
      value: session.quantity / session.participant_count, 
      unit: unitInfo.unit 
    };
  }
};

// Helper function to get ml from serving size for liquor
export const getMlFromServingSize = (servingSize?: string): number => {
  if (!servingSize) return 0;
  const match = servingSize.match(/(\d+)ml/);
  return match ? parseInt(match[1]) : 0;
};

// Format consumption value with appropriate decimals
export const formatConsumption = (value: number, unit: string): string => {
  const decimals = unit === 'mg' ? 1 : (unit === 'g' ? 2 : 0);
  return `${value.toFixed(decimals)} ${unit}`;
};

// Get smart display for mixed units within a category
export const getSmartCategoryDisplay = (category: Category, totalNormalized: number, hasMultipleUnits: boolean): string => {
  const baseUnit = getCategoryBaseUnit(category);
  
  if (!hasMultipleUnits) {
    // If all sessions use the same unit, display in that unit
    return baseUnit;
  }
  
  // For mixed units, always show in base unit with note
  return `${baseUnit} equiv`;
};

// Check if sessions have multiple units
export const hasMultipleUnits = (sessions: Session[]): boolean => {
  if (sessions.length === 0) return false;
  
  const firstUnit = getSessionUnitInfo(sessions[0].category, sessions[0].session_type).unit;
  return sessions.some(session => {
    const unitInfo = getSessionUnitInfo(session.category, session.session_type);
    return unitInfo.unit !== firstUnit;
  });
};