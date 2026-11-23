import { CreateTwitchBotTables1793055377594 } from './1793055377594-CreateTwitchBotTables.js';
import { AddTwitchFollowers1795362661717 } from './1795362661717-AddTwitchFollowers';
import { AddTwitchMediaTables1795373701448 } from './1795373701448-AddTwitchMediaTables';
import { AddTwitchFriends1795427079734 } from './1795427079734-AddTwitchFriends';
import { AddTwitchLiveStreams1795431705074 } from './1795431705074-AddTwitchLiveStreams';

export const twitchBotMigrations = [
  CreateTwitchBotTables1793055377594,
  AddTwitchFollowers1795362661717,
  AddTwitchMediaTables1795373701448,
  AddTwitchFriends1795427079734,
  AddTwitchLiveStreams1795431705074,
];
