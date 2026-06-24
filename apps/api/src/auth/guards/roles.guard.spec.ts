import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AuthUser } from "../types/auth-user";
import { RolesGuard } from "./roles.guard";

function createContext(user?: AuthUser): ExecutionContext {
  const handler = jest.fn();
  const controller = jest.fn();

  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it("allows a user with one of the required roles", () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.MANAGER,
    ]);

    const allowed = guard.canActivate(
      createContext({
        id: "manager-id",
        email: "manager@teamsync.dev",
        role: UserRole.MANAGER,
      }),
    );

    expect(allowed).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it("allows requests when a route has no required roles", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it("rejects a user without a required role", () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const allowed = guard.canActivate(
      createContext({
        id: "member-id",
        email: "member@teamsync.dev",
        role: UserRole.MEMBER,
      }),
    );

    expect(allowed).toBe(false);
  });

  it("rejects requests with required roles but no authenticated user", () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext())).toBe(false);
  });
});
