import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Source } from "../models/source";
import { ViewMode } from "../models/viewMode";
import { MediaType } from "../models/mediaType";
import { Group } from "../models/group";
import { invoke } from "@tauri-apps/api/core";
import { MemoryService } from "../memory.service";

export interface SidebarCategoryEvent {
  groupId: number;
  sourceId: number;
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent {
  @Input() currentViewMode: number = ViewMode.All;
  @Input() chkLiveStream: boolean = true;
  @Input() chkMovie: boolean = true;
  @Input() chkSerie: boolean = true;
  @Input() showSeriesFilter: boolean = true;

  @Output() viewModeChanged = new EventEmitter<ViewMode>();
  @Output() categorySelected = new EventEmitter<SidebarCategoryEvent>();
  @Output() mediaTypeToggled = new EventEmitter<MediaType>();
  @Output() settingsClicked = new EventEmitter<void>();

  collapsed = false;
  viewModeEnum = ViewMode;
  mediaTypeEnum = MediaType;
  sourceCategories: Map<number, Group[]> = new Map();
  expandedSources: Set<number> = new Set();

  constructor(public memory: MemoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  selectViewMode(mode: ViewMode) {
    this.viewModeChanged.emit(mode);
  }

  selectCategory(groupId: number, sourceId: number) {
    this.categorySelected.emit({ groupId, sourceId });
  }

  toggleMediaType(type: MediaType) {
    this.mediaTypeToggled.emit(type);
  }

  toggleSource(sourceId: number) {
    if (this.expandedSources.has(sourceId)) {
      this.expandedSources.delete(sourceId);
    } else {
      this.expandedSources.add(sourceId);
      if (!this.sourceCategories.has(sourceId)) {
        this.loadSourceCategories(sourceId);
      }
    }
  }

  async loadCategories() {
    for (const [sourceId] of this.memory.Sources) {
      this.loadSourceCategories(sourceId);
    }
  }

  async loadSourceCategories(sourceId: number) {
    try {
      const groups: Group[] = await invoke("group_auto_complete", {
        query: null,
        sourceId: sourceId,
      });
      this.sourceCategories.set(sourceId, groups);
    } catch (_) {
      this.sourceCategories.set(sourceId, []);
    }
  }

  openSettings() {
    this.settingsClicked.emit();
  }

  getSourceName(sourceId: number): string {
    return this.memory.Sources.get(sourceId)?.name || `Source ${sourceId}`;
  }
}
