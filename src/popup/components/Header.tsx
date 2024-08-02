import { ClassValue } from 'clsx';
import { LucideIcon, RotateCcw } from 'lucide-react';
import { ArrowLeft, List, Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import browser, { type Permissions } from 'webextension-polyfill';
import { Button } from './ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import remote from '@/remote';
import { askOriginPermissions, cn } from '@/utils';

type iconProps = {
  to?: string;
  icon: LucideIcon;
};

type HeaderProps = {
  title?: string;
  icons?: iconProps[];
  className?: ClassValue[];
};

type BannerProps = {
  remoteAvailable: boolean;
};

const routeTitles: { [key: string]: string } = {
  '/settings': 'Settings',
  '/general': 'Leaderboard',
};

const HeaderIcon = (props: iconProps) => {
  const icon = <props.icon size={20} />;

  if (!props.to)
    return (
      <div className="flex justify-center items-center p-3 text-primary-foreground opacity-80 hover:opacity-100">
        {icon}
      </div>
    );

  return (
    <Link
      to={props.to || ''}
      className="flex justify-center items-center p-3 text-primary-foreground opacity-80 hover:opacity-100"
    >
      {icon}
    </Link>
  );
};

const Banner = (props: BannerProps) => {
  if (!props.remoteAvailable)
    return (
      <div className="flex items-center justify-center bg-destructive p-1 text-destructive-foreground">
        Remote not available
      </div>
    );

  const [alarms, setAlarms] = useState<browser.Alarms.Alarm[]>([]);
  const [permissions, setPermissions] = useState<Permissions.AnyPermissions>(
    {}
  );
  useEffect(() => {
    const fetchAlarms = async () => {
      const alarms = await browser.alarms.getAll();
      setAlarms(alarms);
    };
    const fetchPermissions = async () => {
      setPermissions(await browser.permissions.getAll());
    };
    fetchAlarms();
    fetchPermissions();
  }, []);

  if (alarms.length === 0)
    return (
      <div className="flex items-center justify-center gap-2 bg-secondary p-1 text-secondary-foreground">
        <span>Something went wrong, please restart the extension.</span>
        <Button
          className="size-3"
          variant={'ghost'}
          size={'icon'}
          onClick={() => browser.runtime.reload()}
        >
          <RotateCcw className="hover:animate-spin" />
        </Button>
      </div>
    );

  if (permissions.origins && permissions.origins.length === 0)
    return (
      <div className="flex items-center justify-center gap-2 bg-secondary p-1 text-secondary-foreground">
        <span>Pop-a-loon is missing recommended permissions.</span>
        <Button
          variant={'link'}
          className="h-fit p-0 text-xs"
          onClick={async () => {
            await askOriginPermissions();
            setPermissions(await browser.permissions.getAll());
          }}
        >
          Allow
        </Button>
      </div>
    );

  return null;
};

const ListItem = (props: {
  href: string;
  title: string;
  children: string;
  beta?: boolean;
}) => {
  return (
    <NavigationMenuLink
      className={cn(
        navigationMenuTriggerStyle(),
        'w-full flex flex-col justify-start items-start h-auto px-2.5 py-1.5 pb-2'
      )}
      asChild
    >
      <Link to={props.href}>
        <h2 className="text-base font-semibold">{props.title}</h2>
        {props.beta && (
          <Badge
            variant="outline"
            className="absolute right-3 top-3 text-[10px] px-2 leading-none ml-1 border-destructive bg-background"
            title="This feature is in beta and may not work as expected."
          >
            Beta
          </Badge>
        )}

        <p
          className="text-xs text-muted-foreground truncate"
          title={props.children}
        >
          {props.children}
        </p>
      </Link>
    </NavigationMenuLink>
  );
};

export default (props: HeaderProps) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const location = useLocation();

  const title = Object.keys(routeTitles).includes(location.pathname)
    ? routeTitles[location.pathname]
    : props.title || 'Pop-a-loon';

  useEffect(() => {
    remote.isAvailable().then(setIsAvailable);
  }, []);

  return (
    <>
      <header className="select-none bg-primary text-primary-foreground h-11">
        <h1 className="absolute w-full flex justify-center items-center text-xl font-bold h-11">
          {title}
        </h1>
        <NavigationMenu className="">
          <NavigationMenuList className="h-11 px-1 space-x-0 w-dvw max-w-full justify-end">
            {location.pathname !== '/' && (
              <NavigationMenuItem>
                <HeaderIcon to="/" icon={ArrowLeft} />
              </NavigationMenuItem>
            )}
            <div className="flex-grow" />
            <NavigationMenuItem>
              <NavigationMenuTrigger
                hideCheveron
                className="bg-transparent hover:bg-transparent focus:bg-transparent p-0 h-11 max-h-11"
              >
                <HeaderIcon icon={List} />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuIndicator />
                <ul className="grid w-[400px] p-2 grid-cols-2">
                  <ListItem href="/general" title="Leaderboard">
                    View the top players of all time.
                  </ListItem>
                  <ListItem href="/statistics" title="History" beta>
                    View your pop history.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <HeaderIcon to="/settings" icon={Settings} />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <Banner remoteAvailable={isAvailable} />
    </>
  );
};
