import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistContext } from "@/contexts/WishlistContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WishlistButton = ({ jobId, size = "sm", className = "" }) => {
  const { isInWishlist, toggleWishlist } = useWishlistContext();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isWishlisted = isInWishlist(jobId);

  const handleWishlistToggle = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await toggleWishlist(jobId);
      if (result.success) {
        setMessage(result.message);
        // Clear message after 2 seconds
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(result.message);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Something went wrong");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`relative ${className} ${
            isWishlisted
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            </div>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {message ||
            (isWishlisted ? "Remove from wishlist" : "Add to wishlist")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WishlistButton;
