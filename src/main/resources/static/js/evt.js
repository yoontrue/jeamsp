function Event()
{
    this.eventHandlers = new Array();
}

Event.prototype.addHandler = function(eventHandler)
{
    this.eventHandlers.push(eventHandler);
}

Event.prototype.raise = function(arg1, arg2, arg3, arg4, arg5)
{
    for(var i = 0; i < this.eventHandlers.length; i++)
    {
        this.eventHandlers[i](arg1, arg2, arg3, arg4, arg5);
    }
}
