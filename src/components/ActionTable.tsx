import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, TrashIcon, CheckIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface Action {
  id: string;
  action: string;
  assignedTo: string;
  deadline: Date | null;
  status: "Not Started" | "In Progress" | "Completed";
}

interface ActionTableProps {
  actions?: Action[];
  onActionAdd?: (action: Omit<Action, "id">) => void;
  onActionUpdate?: (action: Action) => void;
  onActionDelete?: (id: string) => void;
}

const ActionTable = ({
  actions: initialActions = [],
  onActionAdd,
  onActionUpdate,
  onActionDelete,
}: ActionTableProps) => {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [newAction, setNewAction] = useState<Omit<Action, "id">>({
    action: "",
    assignedTo: "",
    deadline: null,
    status: "Not Started",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleAddAction = () => {
    const action = {
      ...newAction,
      id: Math.random().toString(36).substring(2, 9),
    };

    const updatedActions = [...actions, action];
    setActions(updatedActions);

    if (onActionAdd) {
      onActionAdd(newAction);
    }

    setNewAction({
      action: "",
      assignedTo: "",
      deadline: null,
      status: "Not Started",
    });
    setDialogOpen(false);
  };

  const handleStatusChange = (
    id: string,
    status: "Not Started" | "In Progress" | "Completed",
  ) => {
    const updatedActions = actions.map((action) => {
      if (action.id === id) {
        const updatedAction = { ...action, status };
        if (onActionUpdate) {
          onActionUpdate(updatedAction);
        }
        return updatedAction;
      }
      return action;
    });

    setActions(updatedActions);
  };

  const handleDeleteAction = (id: string) => {
    const updatedActions = actions.filter((action) => action.id !== id);
    setActions(updatedActions);

    if (onActionDelete) {
      onActionDelete(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Not Started":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Not Started
          </Badge>
        );
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-lg font-semibold">Action Tracker</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              Add Action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Action</DialogTitle>
              <DialogDescription>
                Create a new action item to track recommendations and
                follow-ups.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  placeholder="Enter action description"
                  value={newAction.action}
                  onChange={(e) =>
                    setNewAction({ ...newAction, action: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Enter person responsible"
                  value={newAction.assignedTo}
                  onChange={(e) =>
                    setNewAction({ ...newAction, assignedTo: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAction.deadline ? (
                        format(newAction.deadline, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newAction.deadline || undefined}
                      onSelect={(date) => {
                        setNewAction({ ...newAction, deadline: date });
                        setDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue="Not Started"
                  onValueChange={(value) =>
                    setNewAction({
                      ...newAction,
                      status: value as
                        | "Not Started"
                        | "In Progress"
                        | "Completed",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAction}
                disabled={!newAction.action || !newAction.assignedTo}
              >
                Add Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No actions have been added yet.</p>
            <p className="text-sm mt-2">
              Click "Add Action" to create your first action item.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.action}</TableCell>
                  <TableCell>{action.assignedTo}</TableCell>
                  <TableCell>
                    {action.deadline
                      ? format(action.deadline, "PPP")
                      : "No deadline"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(action.status)}
                      <Select
                        defaultValue={action.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            action.id,
                            value as
                              | "Not Started"
                              | "In Progress"
                              | "Completed",
                          )
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">
                            Not Started
                          </SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {action.status === "Completed" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ActionTable;
