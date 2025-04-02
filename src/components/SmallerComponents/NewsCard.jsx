

const NewsCard = ({ card }) => {
  return (
    <div className="h-full flex flex-col bg-white border-gray-50 dark:border-black rounded-lg dark:bg-gray-800 overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        {card.image ? (
          <img 
            className="w-full h-full object-cover" 
            src={card.image} 
            alt={card.headline} 
            loading="lazy" // This prevents image reload
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none shadow-lg inset-shadow-sm inset-shadow-blue-500" 
             ></div>
      </div>
      <div className="p-5 flex-grow">
        <p className="font-medium text-sm text-gray-500 dark:text-white">{card.source}</p>
        <p className="font-medium text-sm text-gray-500 dark:text-white">
          {new Date(card.datetime * 1000).toLocaleDateString("en-GB")}
        </p>
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-4">
          {card.headline}
        </h5>
      </div>
    </div>
  );
}

export default NewsCard;
