'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Grid3x3 } from 'lucide-react';
import { googleApps } from '@/lib/data';
import Image from 'next/image';

export function AppLauncher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Grid3x3 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Google Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-3 gap-2 p-2">
            {googleApps.map((app) => (
                <a href={app.url} target="_blank" rel="noopener noreferrer" key={app.name}>
                    <div className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted aspect-square">
                        <Image src={app.icon} alt={app.name} width={32} height={32} />
                        <span className="text-xs text-center text-muted-foreground">{app.name}</span>
                    </div>
                </a>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
