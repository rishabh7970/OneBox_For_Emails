import { Badge } from "./ui/badge";

interface CategoryBadgeProps {
  category?: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) {
    return <Badge variant="outline">Uncategorized</Badge>;
  }

  const variants: Record<string, { variant: any; className: string }> = {
    "Interested": { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    "Meeting Booked": { variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
    "Not Interested": { variant: "secondary", className: "bg-gray-500 hover:bg-gray-600" },
    "Spam": { variant: "destructive", className: "" },
    "Out of Office": { variant: "outline", className: "border-orange-500 text-orange-700" }
  };

  const config = variants[category] || { variant: "outline", className: "" };

  return (
    <Badge variant={config.variant} className={config.className}>
      {category}
    </Badge>
  );
}
