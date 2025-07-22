import React from 'react';

interface ContentBlockProps {
  imageUrl?: string;
  title: string;
  description: string;
  link?: string;
  onClick?: () => void;
  className?: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  imageUrl,
  title,
  description,
  link,
  onClick,
  className = ""
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {imageUrl && (
        <div className="aspect-square w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
};