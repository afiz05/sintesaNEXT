"use client";
import React, { useContext, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarItem,
} from "@heroui/react";

import { deleteAuthCookie } from "@/actions/auth.action";
import Link from "next/link";
import MyContext from "@/utils/Context";

export const UserDropdownjsx = () => {
  const router = useRouter();
  const context = useContext(MyContext);
  const { name, logout } = context || { name: "User" };

  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Avatar
            as="button"
            color="secondary"
            size="md"
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu aria-label="User menu actions">
        <DropdownItem className="flex flex-col items-start">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="font-medium">{name}</p>
        </DropdownItem>
        <DropdownItem key="settings">My Settings</DropdownItem>
        <DropdownItem key="team_settings">Team Settings</DropdownItem>
        <DropdownItem key="analytics">Analytics</DropdownItem>
        <DropdownItem key="system">System</DropdownItem>
        <DropdownItem key="configurations">Configurations</DropdownItem>
        <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
        <DropdownItem key="user-manage">
          <Link href="/accounts" className="w-full block text-left">
            User Management
          </Link>
        </DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          onPress={handleLogout}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
