
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, UserCog, HelpCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserNavProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'customer' | 'operator' | 'staff';
  };
}

export function UserNav({ user = {
  name: "Admin User",
  email: "admin@droneflux.com",
  role: "admin"
} }: UserNavProps) {
  const navigate = useNavigate();
  
  // Get initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
    
  const roleLabel = {
    admin: "Administrator",
    customer: "Customer",
    operator: "Drone Operator",
    staff: "Delivery Staff"
  }[user.role] || "User";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-x-2 rounded-full border border-transparent p-0.5 pr-2 hover:bg-muted/50 hover:border-border transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground leading-none mt-1">{roleLabel}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/help")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/documentation")}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Documentation</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/login")}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
