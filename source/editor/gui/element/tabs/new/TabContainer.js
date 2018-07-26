"use strict";

function TabContainer(parent)
{
	Element.call(this, parent);

	this.element.style.overflow = "visible";
	this.element.style.backgroundColor = Editor.theme.panelColor;

	this.preventDragEvents();
	
	//Buttons
	this.buttons = document.createElement("div");
	this.buttons.style.overflow = "hidden";
	this.buttons.style.position = "absolute";
	this.buttons.style.backgroundColor = Editor.theme.buttonColor;
	this.element.appendChild(this.buttons);

	//Tab
	this.tab = document.createElement("div");
	this.tab.style.position = "absolute";
	this.tab.style.overflow = "visible";
	this.element.appendChild(this.tab);

	//Options
	this.mode = TabGroup.TOP;
	this.buttonSize = new THREE.Vector2(140, 20);
	this.selected = null;
	this.options = [];
}

TabContainer.prototype = Object.create(Element.prototype);

//Update all tabs object data
TabContainer.prototype.updateMetadata = function()
{
	for(var i = 0; i < this.options.length; i++)
	{
		this.options[i].updateMetadata();
	}
};

//Update all tab object views
TabContainer.prototype.updateObjectsView = function(changes)
{
	for(var i = 0; i < this.options.length; i++)
	{
		this.options[i].updateObjectsView();
	}
};

//Update all tab object views
TabContainer.prototype.updateSelection = function()
{
	for(var i = 0; i < this.options.length; i++)
	{
		this.options[i].updateSelection();
	}
};

//Update all tab object views
TabContainer.prototype.updateSettings = function()
{
	for(var i = 0; i < this.options.length; i++)
	{
		this.options[i].updateSettings();
	}
};

//Get actual tab
TabContainer.prototype.getActual = function()
{
	if(this.selected !== null)
	{
		return this.selected;
	}

	return null;
};

//Close actual tab if its closeable
TabContainer.prototype.closeActual = function()
{
	if(this.selected !== null)
	{
		if(this.selected.closeable)
		{
			this.selected.deactivate();
			this.removeTab(this.selected);
		}
	}
};

//Select tab
TabContainer.prototype.selectTab = function(tab)
{
	if(this.selected !== null)
	{
		this.selected.deactivate();
	}

	//Tab as a TabElement object
	if(tab instanceof TabElement)
	{
		this.selected = tab;
		this.selected.activate();
		this.updateInterface();
	}
	//Tab as a index
	else if(typeof tab === "number" && tab > -1 && tab < this.options.length)
	{
		this.selected = this.options[tab];
		this.selected.activate();
		this.updateInterface();
	}
	else
	{
		this.selected = null;
	}
};

//Select next tab
TabContainer.prototype.selectNextTab = function()
{
	if(this.options.length > 0)
	{
		this.selectTab((this.selected.index + 1) % this.options.length);
	}
};

//Select previous tab
TabContainer.prototype.selectPreviousTab = function()
{
	if(this.options.length > 0)
	{
		if(this.selected.index === 0)
		{
			this.selectTab(this.options.length - 1);
		}
		else
		{
			this.selectTab(this.selected.index - 1);
		}
	}
};

//Add new option to tab grounp
TabContainer.prototype.addTab = function(TabConstructor, closeable)
{
	var tab = new TabConstructor(this.tab, closeable, this, this.options.length);
	var button = new TabSelector(this.buttons, tab);
	tab.button = button;

	this.options.push(tab);
	if(this.selected === null)
	{
		this.selectTab(tab);
	}

	return tab;
};

//Get tab from tab type and attached object is there is any
TabContainer.prototype.getTab = function(type, obj)
{
	for(var i = 0; i < this.options.length; i++)
	{
		if(this.options[i] instanceof type)
		{
			if(obj === undefined || this.options[i].isAttached(obj))
			{
				return this.options[i];
			}
		}
	}

	return null;
};

//Attach tab to this group and remove it from the original group
TabContainer.prototype.attachTab = function(tab, insertIndex)
{
	tab.container.removeTab(tab.index, true);

	tab.container = this;
	tab.button.attachTo(this.buttons);
	tab.attachTo(this.tab);
	
	if(insertIndex !== undefined)
	{
		tab.index = insertIndex;
		this.options.splice(insertIndex, 0, tab);
	}
	else
	{
		tab.index = this.options.length;
		this.options.push(tab);
	}

	if(this.selected === null)
	{
		this.selectTab(tab);
	}

	this.updateOptionIndex();
	this.updateInterface();

	return tab;
};

//Remove tab from group
TabContainer.prototype.removeTab = function(index, dontDestroy)
{	
	//If index is an object get the actual index
	if(index instanceof TabElement)
	{
		index = this.options.indexOf(index);
	}

	//Check if the index is in range
	if(index > -1 && index < this.options.length)
	{
		var tab = this.options[index];

		//Remove option from list
		if(dontDestroy !== true)
		{
			tab.destroy();
		}
		this.options.splice(index, 1);

		//Update tabs index
		this.updateOptionIndex();

		//Select option
		if(this.options.length > 0)
		{
			this.selectTab(index !== 0 ? index - 1 : 0);
		}
		else
		{
			this.selectTab(null);
		}

		return tab;
	}

	return null;
};

//Remove all tabs
TabContainer.prototype.clear = function()
{
	while(this.options.length > 0)
	{
		this.options.pop().destroy();
	}

	this.selectTab(null);
};

//Move tab from position to another
TabContainer.prototype.moveButton = function(origin, destination)
{
	var button = this.options[origin];

	this.options.splice(origin, 1);
	this.options.splice(destination, 0, button);

	this.updateOptionIndex();
	this.updateInterface();
};

//Update tabs index
TabContainer.prototype.updateOptionIndex = function()
{
	for(var i = 0; i < this.options.length; i++)
	{
		this.options[i].index = i;
	}
};

TabContainer.prototype.updateSize = TabGroup.prototype.updateSize;
