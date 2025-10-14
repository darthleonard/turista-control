import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardCell } from 'src/app/models/board-cells';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-position-selector',
  templateUrl: './position-selector.component.html',
  styleUrls: ['./position-selector.component.scss'],
  standalone: false,
})
export class PositionSelectorComponent {
  @Input() selectedId?: number;
  @Output() selected: EventEmitter<number> = new EventEmitter<number>();

  isModalOpen = false;
  boardCells!: BoardCell[];
  searchResults: BoardCell[] = [];
  filterText = '';

  constructor(private readonly boardService: BoardService) {}

  async setOpen(isOpen: boolean) {
    // TODO: if openning, load bought properties
    // TODO: show/hide BUY_PROPERTY button based on property ownership
    this.boardCells = await this.boardService.getBoardCells(1);
    this.searchResults = this.boardCells;
    this.isModalOpen = isOpen;
  }

  onSelect(id: number) {
    this.selected.emit(id);
    this.isModalOpen = false;
  }

  searchCell(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.searchResults = this.boardCells.filter((d) =>
      d.name.toLowerCase().includes(query)
    );
  }

  get filteredCells() {
    const text = this.filterText.trim().toLowerCase();
    if (!text) return this.boardCells;
    return this.boardCells.filter((c) => c.name.toLowerCase().includes(text));
  }
}
