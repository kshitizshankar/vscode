/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as DOM from 'vs/base/browser/dom';
import * as lifecycle from 'vs/base/common/lifecycle';
import * as strings from 'vs/base/common/strings';
import { IAction, Action } from 'vs/base/common/actions';
import { BaseActionItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { CommonKeybindings } from 'vs/base/common/keyCodes';
import {IKeyboardEvent} from 'vs/base/browser/keyboardEvent';
import {IContextViewService} from 'vs/platform/contextview/browser/contextView';
import Messages from 'vs/workbench/parts/markers/common/messages';
import { FilterOptions } from 'vs/workbench/parts/markers/common/markersModel';
import { MarkersPanel } from 'vs/workbench/parts/markers/browser/markersPanel';

export class FilterAction extends Action {

	constructor(private markersPanel: MarkersPanel) {
		super('workbench.markers.panel.action.filter', Messages.MARKERS_PANEL_ACTION_TOOLTIP_FILTER, 'markers-panel-action-filter', true);
	}

}

export class FilterInputBoxActionItem extends BaseActionItem {

	protected toDispose: lifecycle.IDisposable[];

	constructor(private markersPanel: MarkersPanel, action: IAction,
			@IContextViewService private contextViewService: IContextViewService) {
		super(markersPanel, action);
		this.toDispose = [];
	}

	public render(container: HTMLElement): void {
		DOM.addClass(container, 'markers-panel-action-filter');
		var filterInputBoxContainer = DOM.append(container, DOM.emmet('.input-box-container'));
		var filterInputBox = new InputBox(filterInputBoxContainer, this.contextViewService, {
			placeholder: Messages.MARKERS_PANEL_FILTER_PLACEHOLDER
		});
		filterInputBox.value= this.markersPanel.markersModel.filterOptions.completeValue;
		this.toDispose.push(filterInputBox.onDidChange((filter: string) => {
			this.markersPanel.markersModel.update(this.prepareFilterOptions(filter));
			this.markersPanel.refreshPanel();
		}));
		this.toDispose.push(DOM.addStandardDisposableListener(filterInputBoxContainer, 'keydown', this.handleKeyboardEvent));
		this.toDispose.push(DOM.addStandardDisposableListener(filterInputBoxContainer, 'keyup', this.handleKeyboardEvent));
	}

	public dispose(): void {
		this.toDispose = lifecycle.dispose(this.toDispose);
		super.dispose();
	}

	// Action toolbar is swallowing some keys for action items which should not be for an input box
	private handleKeyboardEvent(e: IKeyboardEvent) {
		switch (e.keyCode) {
			case CommonKeybindings.SPACE:
			case CommonKeybindings.LEFT_ARROW:
			case CommonKeybindings.RIGHT_ARROW:
				e.stopPropagation();
				break;
		}
	}

	private prepareFilterOptions(filter:string): FilterOptions {
		let filterOptions:FilterOptions= new FilterOptions();
		filterOptions.completeValue= filter;

		filter= strings.trim(filter);
		if (!filter) {
			return filterOptions;
		}

		let startIndex= 0;
		if (strings.startsWith(filter.toLocaleLowerCase(), Messages.MARKERS_PANEL_FILTER_ERRORS)) {
			filterOptions.filterErrors= true;
			startIndex= (Messages.MARKERS_PANEL_FILTER_ERRORS).length;
		}
		if (strings.startsWith(filter.toLocaleLowerCase(), Messages.MARKERS_PANEL_FILTER_WARNINGS)) {
			filterOptions.filterWarnings= true;
			startIndex= (Messages.MARKERS_PANEL_FILTER_WARNINGS).length;
		}
		if (strings.startsWith(filter.toLocaleLowerCase(), Messages.MARKERS_PANEL_FILTER_INFOS)) {
			filterOptions.filterInfos= true;
			startIndex= (Messages.MARKERS_PANEL_FILTER_INFOS).length;
		}
		filterOptions.filterValue= filter.substr(startIndex).trim();
		return filterOptions;
	}
}