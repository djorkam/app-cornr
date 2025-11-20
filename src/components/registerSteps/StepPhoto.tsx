import React from "react";
import { Upload, Camera } from "lucide-react";
import { RegisterFormDataType } from "../../types/registerTypes";

interface StepPhotoProps {
  photo: RegisterFormDataType["photo"];
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
}

const StepPhoto: React.FC<StepPhotoProps> = ({
  photo,
  handlePhotoUpload,
  handleNext,
}) => {
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (photo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(photo);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  return (
    <>
      <div className="text-center mb-8">
        <p className="text-gray-600 leading-relaxed">
          Profiles with photos get way more love.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          <div className="text-center">
            {photo ? (
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-purple-200">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-purple-600" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Photo selected!
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-medium mb-2">No photo yet</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Add one to make your profile stand out.
                  </p>
                </div>
              </div>
            )}

            <label className="inline-flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-3 px-6 rounded-xl cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              <span>{photo ? "Change photo" : "Select photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              We recommend using a clear face photo, alone or with your partner.
            </p>
          </div>

          <button onClick={handleNext} className="btn-primary">
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default StepPhoto;