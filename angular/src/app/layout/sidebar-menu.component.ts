import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import {
  Router,
  RouterEvent,
  NavigationEnd,
  PRIMARY_OUTLET,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { MenuItem } from "@shared/layout/menu-item";

@Component({
  selector: "sidebar-menu",
  templateUrl: "./sidebar-menu.component.html",
})
export class SidebarMenuComponent extends AppComponentBase implements OnInit {
  menuItems: MenuItem[];
  menuItemsMap: { [key: number]: MenuItem } = {};
  activatedMenuItems: MenuItem[] = [];
  routerEvents: BehaviorSubject<RouterEvent> = new BehaviorSubject(undefined);
  homeRoute = "/app/about";

  constructor(injector: Injector, private router: Router) {
    super(injector);
  }

  ngOnInit(): void {
    this.menuItems = this.getMenuItems();
    this.patchMenuItems(this.menuItems);

    this.router.events.subscribe((event: NavigationEnd) => {
      const currentUrl = event.url !== "/" ? event.url : this.homeRoute;
      const primaryUrlSegmentGroup =
        this.router.parseUrl(currentUrl).root.children[PRIMARY_OUTLET];
      if (primaryUrlSegmentGroup) {
        this.activateMenuItems("/" + primaryUrlSegmentGroup.toString());
      }
    });
  }

  getMenuItems(): MenuItem[] {
    return [
      new MenuItem(this.l("About"), "/app/about", "fas fa-info-circle"),
      new MenuItem(this.l("HomePage"), "/app/home", "fas fa-home"),
      new MenuItem(
        this.l("Roles"),
        "/app/roles",
        "fas fa-theater-masks",
        "Pages.Roles"
      ),
      new MenuItem(
        this.l("Tenants"),
        "/app/tenants",
        "fas fa-building",
        "Pages.Tenants"
      ),
      new MenuItem(
        this.l("Users"),
        "/app/users",
        "fas fa-users",
        "Pages.Users"
      ),
      new MenuItem(this.l("Books"), "/app/book", "fas fa-book"),
      new MenuItem(this.l("FileUploads"), "/app/fileupload", "fas fa-book"),
      new MenuItem(this.l("Addmission"), "", "fas fa-school", "", [
        new MenuItem(this.l("Courses"), "/app/course", "fas fa-user-graduate"),
        new MenuItem(this.l("Students"), "/app/student", "fas fa-user"),
      ]),
      new MenuItem(this.l("Globe"), "", "fas fa-earth-americas", "", [
        new MenuItem(this.l("Countries"), "/app/country", "fas fa-globe"),
        new MenuItem(this.l("States"), "/app/state", "fas fa-globe"),
        new MenuItem(this.l("Cities"), "/app/city", "fas fa-globe"),
      ]),
      new MenuItem(this.l("Hospital-Management"), "", "fas fa-hospital", "", [
        new MenuItem(this.l("Beds"), "/app/bed", "fas fa-globe"),
        new MenuItem(this.l("Patients"), "/app/patient", "fas fa-globe"),
        new MenuItem(this.l("Addmissions"), "/app/addmission", "fas fa-globe"),
      ]),
      // new MenuItem(this.l("MultiLevelMenu"), "", "fas fa-circle", "", [
      //   new MenuItem("ASP.NET Boilerplate", "", "fas fa-dot-circle", "", [
      //     new MenuItem(
      //       "Home",
      //       "https://aspnetboilerplate.com?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Templates",
      //       "https://aspnetboilerplate.com/Templates?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Samples",
      //       "https://aspnetboilerplate.com/Samples?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Documents",
      //       "https://aspnetboilerplate.com/Pages/Documents?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //   ]),
      //   new MenuItem("ASP.NET Zero", "", "fas fa-dot-circle", "", [
      //     new MenuItem(
      //       "Home",
      //       "https://aspnetzero.com?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Features",
      //       "https://aspnetzero.com/Features?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Pricing",
      //       "https://aspnetzero.com/Pricing?ref=abptmpl#pricing",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Faq",
      //       "https://aspnetzero.com/Faq?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //     new MenuItem(
      //       "Documents",
      //       "https://aspnetzero.com/Documents?ref=abptmpl",
      //       "far fa-circle"
      //     ),
      //   ]),
      // ]),
    ];
  }

  patchMenuItems(items: MenuItem[], parentId?: number): void {
    items.forEach((item: MenuItem, index: number) => {
      item.id = parentId ? Number(parentId + "" + (index + 1)) : index + 1;
      if (parentId) {
        item.parentId = parentId;
      }
      if (parentId || item.children) {
        this.menuItemsMap[item.id] = item;
      }
      if (item.children) {
        this.patchMenuItems(item.children, item.id);
      }
    });
  }

  activateMenuItems(url: string): void {
    this.deactivateMenuItems(this.menuItems);
    this.activatedMenuItems = [];
    const foundedItems = this.findMenuItemsByUrl(url, this.menuItems);
    foundedItems.forEach((item) => {
      this.activateMenuItem(item);
    });
  }

  deactivateMenuItems(items: MenuItem[]): void {
    items.forEach((item: MenuItem) => {
      item.isActive = false;
      item.isCollapsed = true;
      if (item.children) {
        this.deactivateMenuItems(item.children);
      }
    });
  }

  findMenuItemsByUrl(
    url: string,
    items: MenuItem[],
    foundedItems: MenuItem[] = []
  ): MenuItem[] {
    items.forEach((item: MenuItem) => {
      if (item.route === url) {
        foundedItems.push(item);
      } else if (item.children) {
        this.findMenuItemsByUrl(url, item.children, foundedItems);
      }
    });
    return foundedItems;
  }

  activateMenuItem(item: MenuItem): void {
    item.isActive = true;
    if (item.children) {
      item.isCollapsed = false;
    }
    this.activatedMenuItems.push(item);
    if (item.parentId) {
      this.activateMenuItem(this.menuItemsMap[item.parentId]);
    }
  }

  isMenuItemVisible(item: MenuItem): boolean {
    if (!item.permissionName) {
      return true;
    }
    return this.permission.isGranted(item.permissionName);
  }
}
