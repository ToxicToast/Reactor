import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import type { ViewerRow } from '../interfaces/index.js';
import { twitchIdColumn, viewerColumns } from './twitch.columns.js';

export const TwitchViewerSchema = new EntitySchema<ViewerRow>({
  name: 'TwitchViewer',
  tableName: 'twitch_viewers',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    ...viewerColumns,
    user_id: primaryColumn(viewerColumns.user_id),
    last_seen_at: { type: 'timestamptz' },
  },
});
