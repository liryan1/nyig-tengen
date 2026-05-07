"use client";

import { useState, useMemo } from "react";
import {
  useGetTeamMembersQuery,
  useUpdateTeamMemberMutation,
} from "@/lib/rtk/slices/teams";
import { TeamRole } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatefulPagination } from "../nav/StatefulPagination";
import { Check, Loader2, Search, Edit2, X } from "lucide-react";
import { debounce } from "@/lib/utils";
import { toast } from "sonner";

interface ManageMembersProps {
  slug: string;
  myRole?: TeamRole | null;
  currentUserId?: string;
}

export const ManageMembers = ({
  slug,
  myRole,
  currentUserId,
}: ManageMembersProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");

  const { data, isLoading, isFetching } = useGetTeamMembersQuery({
    slug,
    page,
    search,
  });

  const [updateMember, { isLoading: isUpdating }] =
    useUpdateTeamMemberMutation();

  const [localRoles, setLocalRoles] = useState<Record<string, TeamRole>>({});
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleRoleChange = (userId: string, newRole: TeamRole) => {
    setLocalRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = async (userId: string) => {
    const role = localRoles[userId];
    if (!role) return;

    try {
      await updateMember({ slug, userId, role }).unwrap();
      toast.success("Member role updated successfully");
      setLocalRoles((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err) {
      toast.error("Failed to update member role");
    }
  };

  const handleSaveName = async (userId: string) => {
    try {
      await updateMember({
        slug,
        userId,
        assignedName: pendingName === "" ? null : pendingName,
      }).unwrap();
      toast.success("Member name assigned successfully");
      setEditingNameId(null);
    } catch (err) {
      toast.error("Failed to assign member name");
    }
  };

  const canManage = myRole === TeamRole.OWNER;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg md:text-xl font-bold">
            Manage Members
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={pendingSearch}
              onChange={handleSearchChange}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 md:px-6">Member</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[50px] md:w-[80px] text-right px-4 md:px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : data?.members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.members.map((member) => {
                  const currentRole = localRoles[member.id] || member.role;
                  const isRoleChanged =
                    localRoles[member.id] &&
                    localRoles[member.id] !== member.role;
                  // owners cannot change their own role
                  const isSelf = !!currentUserId && member.id === currentUserId;
                  const isEditingName = editingNameId === member.id;

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="px-4 md:px-6">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <Avatar className="h-7 w-7 md:h-8 md:w-8">
                            <AvatarImage src={member.image || ""} />
                            <AvatarFallback className="text-[10px] md:text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isEditingName ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={pendingName}
                                    onChange={(e) =>
                                      setPendingName(e.target.value)
                                    }
                                    className="h-7 text-xs w-32 px-2"
                                    autoFocus
                                    placeholder="Assign name..."
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleSaveName(member.id);
                                      if (e.key === "Escape")
                                        setEditingNameId(null);
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-green-600 hover:bg-green-50"
                                    onClick={() => handleSaveName(member.id)}
                                    disabled={isUpdating}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-red-600 hover:bg-red-50"
                                    onClick={() => setEditingNameId(null)}
                                    disabled={isUpdating}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm font-medium truncate">
                                    {member.assignedName || member.name}
                                    {isSelf && (
                                      <Badge
                                        variant="secondary"
                                        className="h-3.5 px-1 text-[9px] font-bold ml-1.5"
                                      >
                                        YOU
                                      </Badge>
                                    )}
                                  </span>
                                  {canManage && !isSelf && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0"
                                      onClick={() => {
                                        setEditingNameId(member.id);
                                        setPendingName(
                                          member.assignedName || member.name,
                                        );
                                      }}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {member.assignedName && (
                                <span className="text-[10px] text-muted-foreground italic truncate">
                                  Original: {member.name}
                                </span>
                              )}
                              <span className="md:hidden text-[10px] text-muted-foreground">
                                Joined{" "}
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {/* Only owners can change roles, but not their own */}
                        {canManage && !isSelf ? (
                          <Select
                            value={currentRole}
                            onValueChange={(val) =>
                              handleRoleChange(member.id, val as TeamRole)
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[90px] md:w-[120px] h-8 md:h-9 text-xs md:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TeamRole.MEMBER}>
                                Member
                              </SelectItem>
                              <SelectItem value={TeamRole.ADMIN}>
                                Admin
                              </SelectItem>
                              <SelectItem value={TeamRole.OWNER}>
                                Owner
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] md:text-xs font-normal"
                          >
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-4 md:px-6">
                        {isRoleChanged && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 shadow-sm border border-green-100"
                            onClick={() => handleSaveRole(member.id)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t">
            <StatefulPagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
