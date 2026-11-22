import { CreateBlogTables1792491412125 } from './1792491412125-CreateBlogTables.js';
import { AddOutboxActor1792515000000 } from './1792515000000-AddOutboxActor.js';
import { AddOutboxCorrelation1792790000000 } from './1792790000000-AddOutboxCorrelation.js';
import { AddPublicMedia1795385821019 } from './1795385821019-AddPublicMedia';

export const blogMigrations = [
  CreateBlogTables1792491412125,
  AddOutboxActor1792515000000,
  AddOutboxCorrelation1792790000000,
  AddPublicMedia1795385821019,
];
