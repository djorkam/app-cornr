import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Info, MapPin, Users, Heart } from 'lucide-react';

interface DiscoveryPreferences {
  maxDistance: number;
  pauseDiscovery: boolean;
  // For singles (unicorns)
  preferredCoupleAgeRange: [number, number];
  coupleComposition: string[];
  // For couples
  preferredUnicornAgeRange: [number, number];
  preferredUnicornGender: string[];
}

interface DiscoveryPreferencesScreenProps {
  userType: 'unicorn' | 'couple';
  onBack: () => void;
  onSave: (preferences: DiscoveryPreferences) => void;
  initialPreferences?: Partial<DiscoveryPreferences>;
}

const defaultPreferences: DiscoveryPreferences = {
  maxDistance: 50,
  pauseDiscovery: false,
  preferredCoupleAgeRange: [22, 45],
  coupleComposition: ['any-couple'],
  preferredUnicornAgeRange: [22, 45],
  preferredUnicornGender: ['open-to-all']
};

const coupleCompositionOptions = [
  { id: 'any-couple', label: 'Any couple', description: 'Open to all couple types' },
  { id: 'two-women', label: 'Two women', description: 'Female-female couples' },
  { id: 'two-men', label: 'Two men', description: 'Male-male couples' },
  { id: 'woman-man', label: 'Woman & man couple', description: 'Mixed-gender couples' },
  { id: 'other', label: 'Other / self-described', description: 'Non-binary or other compositions' }
];

const unicornGenderOptions = [
  { id: 'woman', label: 'Woman', description: 'Female unicorns' },
  { id: 'man', label: 'Man', description: 'Male unicorns' },
  { id: 'non-binary', label: 'Non-binary person', description: 'Non-binary unicorns' },
  { id: 'open-to-all', label: 'Open to all', description: 'Any gender identity' }
];

export const DiscoveryPreferencesScreen: React.FC<DiscoveryPreferencesScreenProps> = ({
  userType,
  onBack,
  onSave,
  initialPreferences = {}
}) => {
  const [preferences, setPreferences] = useState<DiscoveryPreferences>({
    ...defaultPreferences,
    ...initialPreferences
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const initial = { ...defaultPreferences, ...initialPreferences };
    const current = preferences;
    
    const changed = JSON.stringify(initial) !== JSON.stringify(current);
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  const handleDistanceChange = (value: number) => {
    setPreferences(prev => ({ ...prev, maxDistance: value }));
  };

  const handlePauseToggle = () => {
    setPreferences(prev => ({ ...prev, pauseDiscovery: !prev.pauseDiscovery }));
  };

  const handleAgeRangeChange = (field: 'preferredCoupleAgeRange' | 'preferredUnicornAgeRange', values: [number, number]) => {
    setPreferences(prev => ({ ...prev, [field]: values }));
  };

  const handleMultiSelectChange = (field: 'coupleComposition' | 'preferredUnicornGender', optionId: string) => {
    setPreferences(prev => {
      const currentValues = prev[field];
      
      // Handle "any-couple" and "open-to-all" as exclusive options
      if (optionId === 'any-couple' || optionId === 'open-to-all') {
        return { ...prev, [field]: [optionId] };
      }
      
      // Remove "any-couple" or "open-to-all" if selecting specific options
      const filteredValues = currentValues.filter(v => v !== 'any-couple' && v !== 'open-to-all');
      
      if (filteredValues.includes(optionId)) {
        const newValues = filteredValues.filter(v => v !== optionId);
        return { ...prev, [field]: newValues.length > 0 ? newValues : ['any-couple'] };
      } else {
        return { ...prev, [field]: [...filteredValues, optionId] };
      }
    });
  };

  const handleSave = () => {
    onSave(preferences);
  };

  const RangeSlider: React.FC<{
    label: string;
    min: number;
    max: number;
    values: [number, number];
    onChange: (values: [number, number]) => void;
    tooltip?: string;
  }> = ({ label, min, max, values, onChange, tooltip }) => {
    const [minValue, maxValue] = values;
    const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    const getValueFromPosition = (clientX: number): number => {
      if (!sliderRef.current) return min;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + percent * (max - min));
    };

    const handlePointerDown = (thumb: 'min' | 'max', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveThumb(thumb);
      setIsDragging(true);
      
      // Capture pointer for smooth dragging
      (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging || !activeThumb) return;
      
      e.preventDefault();
      const newValue = getValueFromPosition(e.clientX);
      
      if (activeThumb === 'min') {
        const clampedMin = Math.min(newValue, maxValue - 1);
        onChange([Math.max(min, clampedMin), maxValue]);
      } else {
        const clampedMax = Math.max(newValue, minValue + 1);
        onChange([minValue, Math.min(max, clampedMax)]);
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (isDragging) {
        e.preventDefault();
        setActiveThumb(null);
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
      }
    };

    // Calculate the percentage positions for styling
    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;
    
    return (
      <div className="space-y-3 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="form-label mb-0">{label}</label>
            {tooltip && (
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Fixed label showing current range */}
        <div className="text-center mb-4">
          <span className="text-lg font-semibold text-gray-800">
            Preferred age: 
            <span className={`${activeThumb === 'min' ? 'text-purple-600 font-bold' : ''}`}> {minValue}</span>
            <span className="text-gray-500"> – </span>
            <span className={`${activeThumb === 'max' ? 'text-purple-600 font-bold' : ''}`}>{maxValue}</span>
          </span>
        </div>
        
        {/* Dual-thumb range slider */}
        <div 
          ref={sliderRef}
          className="relative h-6 cursor-pointer"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Track background */}
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-lg"></div>
          
          {/* Selected range fill */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 h-2 bg-purple-400 rounded-lg"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          ></div>
          
          {/* Min thumb */}
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-purple-400 rounded-full shadow-md cursor-pointer transition-all duration-200 z-30 ${
              activeThumb === 'min' ? 'scale-110 border-purple-600' : 'hover:scale-105'
            }`}
            style={{ left: `${minPercent}%`, pointerEvents: 'auto' }}
            onPointerDown={(e) => handlePointerDown('min', e)}
          ></div>
          
          {/* Max thumb */}
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-purple-400 rounded-full shadow-md cursor-pointer transition-all duration-200 z-30 ${
              activeThumb === 'max' ? 'scale-110 border-purple-600' : 'hover:scale-105'
            }`}
            style={{ left: `${maxPercent}%`, pointerEvents: 'auto' }}
            onPointerDown={(e) => handlePointerDown('max', e)}
          ></div>
        </div>
        
        {/* Min/Max labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const MultiSelect: React.FC<{
    label: string;
    options: Array<{ id: string; label: string; description: string }>;
    selectedValues: string[];
    onChange: (optionId: string) => void;
  }> = ({ label, options, selectedValues, onChange }) => {
    return (
      <div className="space-y-3">
        <label className="form-label">{label}</label>
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{option.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-purple-100">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800">Discovery Preferences</h1>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* User Type Badge */}
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userType === 'unicorn'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-pink-100 text-pink-700'
            }`}>
              {userType === 'unicorn' ? '🦄 Unicorn Preferences' : '👫 Couple Preferences'}
            </span>
          </div>

          {/* Shared Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 text-purple-600 mr-2" />
              Location & Visibility
            </h2>
            
            {/* Maximum Distance */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <label className="form-label mb-0">Maximum distance</label>
                <span className="text-sm font-medium text-purple-600">
                  {preferences.maxDistance} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={preferences.maxDistance}
                onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>200 km</span>
              </div>
            </div>

            {/* Pause Discovery */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-800">Pause Discovery</h3>
                <p className="text-sm text-gray-600">Hide your profile temporarily</p>
              </div>
              <button
                onClick={handlePauseToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.pauseDiscovery ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.pauseDiscovery ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Conditional Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              {userType === 'unicorn' ? (
                <>
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  Couple Preferences
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 text-purple-600 mr-2" />
                  Unicorn Preferences
                </>
              )}
            </h2>

            {userType === 'unicorn' ? (
              <div className="space-y-6">
                {/* Age Range for Couples */}
                <RangeSlider
                  label="Preferred average age of couple"
                  min={18}
                  max={99}
                  values={preferences.preferredCoupleAgeRange}
                  onChange={(values) => handleAgeRangeChange('preferredCoupleAgeRange', values)}
                  tooltip="We calculate the simple average of both partners' ages to match"
                />

                {/* Couple Composition */}
                <MultiSelect
                  label="Couple composition you'd like to meet"
                  options={coupleCompositionOptions}
                  selectedValues={preferences.coupleComposition}
                  onChange={(optionId) => handleMultiSelectChange('coupleComposition', optionId)}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Age Range for Unicorns */}
                <RangeSlider
                  label="Preferred age range of unicorn"
                  min={18}
                  max={99}
                  values={preferences.preferredUnicornAgeRange}
                  onChange={(values) => handleAgeRangeChange('preferredUnicornAgeRange', values)}
                />

                {/* Unicorn Gender */}
                <MultiSelect
                  label="Preferred unicorn gender"
                  options={unicornGenderOptions}
                  selectedValues={preferences.preferredUnicornGender}
                  onChange={(optionId) => handleMultiSelectChange('preferredUnicornGender', optionId)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 ${
              hasChanges
                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasChanges ? 'Save Preferences' : 'No Changes'}
          </button>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};