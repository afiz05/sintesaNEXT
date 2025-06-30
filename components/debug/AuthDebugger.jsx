"use client";

import { useState, useEffect, useContext } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import MyContext from "@/utils/Context";
import {
  checkAuthStatus,
  clearAllAuthData,
  forceLogout,
} from "@/utils/authHelper";

export const AuthDebugger = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const context = useContext(MyContext);

  const refreshStatus = () => {
    setIsRefreshing(true);
    const status = checkAuthStatus();
    setAuthStatus(status);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleClearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("status");
      console.log("🗑️ localStorage tokens manually removed");
      refreshStatus();
    }
  };

  const handleClearAllAuth = async () => {
    await clearAllAuthData();
    refreshStatus();
  };

  const handleForceLogout = async () => {
    await forceLogout("Manual force logout from debugger");
  };

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">🔧 Auth Debugger</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            color="primary"
            variant="bordered"
            onPress={refreshStatus}
            isLoading={isRefreshing}
          >
            🔄 Refresh Status
          </Button>

          <Button
            color="warning"
            variant="bordered"
            onPress={handleClearLocalStorage}
          >
            🗑️ Clear localStorage Token
          </Button>

          <Button
            color="danger"
            variant="bordered"
            onPress={handleClearAllAuth}
          >
            🧹 Clear All Auth Data
          </Button>

          <Button color="danger" onPress={handleForceLogout}>
            🚪 Force Logout
          </Button>
        </div>

        {authStatus && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Auth Status:</h4>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex justify-between">
                <span>Context statusLogin:</span>
                <span
                  className={
                    context?.statusLogin ? "text-green-600" : "text-red-600"
                  }
                >
                  {context?.statusLogin ? "✅ true" : "❌ false"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>localStorage token:</span>
                <span
                  className={
                    authStatus.hasLocalStorageToken
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {authStatus.hasLocalStorageToken
                    ? "✅ EXISTS"
                    : "❌ NOT_FOUND"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>sessionStorage token:</span>
                <span
                  className={
                    authStatus.hasSessionStorageToken
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {authStatus.hasSessionStorageToken
                    ? "✅ EXISTS"
                    : "❌ NOT_FOUND"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>localStorage status:</span>
                <span>{authStatus.localStorage.status || "❌ NOT_SET"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <h5 className="font-medium text-blue-800 mb-1">Test Instructions:</h5>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>
              Click "Clear localStorage Token" to simulate manual token removal
            </li>
            <li>Watch for automatic logout behavior in console</li>
            <li>Check if redirect to login page happens correctly</li>
            <li>Use "Force Logout" to test complete logout flow</li>
          </ol>
        </div>
      </CardBody>
    </Card>
  );
};
