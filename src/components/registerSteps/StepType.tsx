import React from "react";
import { Heart, Users } from "lucide-react";

interface StepTypeProps {
  onSelect: (type: "unicorn" | "couple") => void;
  onSwitchToSignIn: () => void;
}

const StepType: React.FC<StepTypeProps> = ({ onSelect, onSwitchToSignIn }) => {
  return (
    <>
      {/* CORNR Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-semibold text-gray-800 mb-4">CORNR</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Who's joining CORNR?
        </p>
      </div>

      {/* User Type Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-4">
          <button
            onClick={() => onSelect("unicorn")}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-25 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  I'm a unicorn 🦄
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Flying solo and open to connection.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect("couple")}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-25 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  We're a couple 👥
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Exploring together and curious.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Not sure? You can update this later in Settings.
          </p>
          <button
            onClick={onSwitchToSignIn}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </>
  );
};

export default StepType;
