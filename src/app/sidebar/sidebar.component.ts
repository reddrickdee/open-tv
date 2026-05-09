import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { MemoryService } from "../memory.service";
import { invoke } from "@tauri-apps/api/core";
import { Source } from "../models/source";
import { ViewMode } from "../models/viewMode";

export interface SidebarGroup {
  id: number;
  name: string;
  sourceId: number;
  channelCount?: number;
  hidden?: boolean;
}

export interface SidebarSource {
  id: number;
  name: string;
  groups: SidebarGroup[];
  expanded: boolean;
}

export interface SidebarSelection {
  type: "view" | "category";
  viewMode?: ViewMode;
  groupId?: number;
  sourceName?: string;
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent implements OnInit {
  @Input() activeViewMode: ViewMode = ViewMode.All;
  @Input() activeGroupId?: number;
  @Output() selectionChange = new EventEmitter<SidebarSelection>();
  @Output() settingsClick = new EventEmitter<void>();

  readonly viewModeEnum = ViewMode;
  sources: SidebarSource[] = [];
  collapsed = false;

  constructor(public memory: MemoryService) {}

  ngOnInit(): void {
    this.loadGroups();
    this.memory.RefreshSources.subscribe(() => {
      this.loadGroups();
    });
  }

  async loadGroups() {
    try {
      const sources = Array.from(this.memory.Sources.values());
      const sidebarSources: SidebarSource[] = [];

      for (const source of sources) {
        const groups: any[] = await invoke("get_groups_for_source", {
          sourceId: source.id,
        });
        sidebarSources.push({
          id: source.id!,
          name: source.name || `Source ${source.id}`,
          groups: groups.map((g) => ({
            id: g.id,
            name: g.name,
            sourceId: source.id!,
            channelCount: g.channel_count,
            hidden: g.hidden,
          })),
          expanded: sources.length === 1,
        });
      }

      this.sources = sidebarSources;
    } catch (e) {
      // Silently fall back — sidebar groups just won't show
      console.warn("Failed to load sidebar groups:", e);
    }
  }

  selectView(mode: ViewMode) {
    this.activeViewMode = mode;
    this.activeGroupId = undefined;
    this.selectionChange.emit({ type: "view", viewMode: mode });
  }

  selectCategory(group: SidebarGroup) {
    this.activeGroupId = group.id;
    this.activeViewMode = ViewMode.Categories;
    this.selectionChange.emit({
      type: "category",
      viewMode: ViewMode.Categories,
      groupId: group.id,
      sourceName: this.sources.find((s) => s.id === group.sourceId)?.name,
    });
  }

  toggleSource(source: SidebarSource) {
    source.expanded = !source.expanded;
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  openSettings() {
    this.settingsClick.emit();
  }

  get totalGroupCount(): number {
    return this.sources.reduce((sum, s) => sum + s.groups.length, 0);
  }

  isViewActive(mode: ViewMode): boolean {
    return this.activeViewMode === mode && this.activeGroupId === undefined;
  }

  isCategoryActive(groupId: number): boolean {
    return this.activeGroupId === groupId;
  }
}
