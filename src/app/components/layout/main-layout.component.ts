import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

// Serviços
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    BreadcrumbModule,
    AvatarModule,
    DividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  // Estado do layout
  sidebarVisible = true; // Sidebar sempre visível por padrão
  mobileSidebarVisible = false;
  
  // Breadcrumbs
  breadcrumbItems: any[] = [];
  home = { icon: 'pi pi-home', url: '/dashboard' };
  
  // Menu do usuário
  userMenuItems = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.navigateToProfile()
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => this.navigateToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  // Menu principal
  menuItems = [
    {
      label: 'Boas-vindas',
      icon: 'pi pi-home',
      routerLink: '/welcome'
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
      routerLink: '/dashboard'
    },
                {
              label: 'Barbearias',
              icon: 'pi pi-building',
              routerLink: '/barbearias'
            },
            {
              label: 'Serviços',
              icon: 'pi pi-list',
              routerLink: '/servicos'
            },
    {
      label: 'Profissionais',
      icon: 'pi pi-users',
      routerLink: '/profissionais'
    },
    {
      label: 'Clientes',
      icon: 'pi pi-user',
      routerLink: '/clientes'
    },
    {
      label: 'Agendamentos',
      icon: 'pi pi-calendar',
      routerLink: '/agendamentos'
    },
    {
      label: 'Relatórios',
      icon: 'pi pi-chart-bar',
      routerLink: '/relatorios'
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configurar breadcrumbs baseado na rota atual
   */
  private setupBreadcrumbs(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  /**
   * Atualizar breadcrumbs baseado na URL atual
   */
  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);
    
    this.breadcrumbItems = segments.map((segment, index) => {
      const label = this.getBreadcrumbLabel(segment);
      const routerLink = '/' + segments.slice(0, index + 1).join('/');
      
      return {
        label: label,
        routerLink: routerLink
      };
    }).filter(item => item.label !== 'Nova' && item.label !== 'Editar'); // Remove breadcrumbs desnecessários
  }

  /**
   * Obter label amigável para o breadcrumb
   */
  private getBreadcrumbLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'barbearias': 'Barbearias',
      'profissionais': 'Profissionais',
      'clientes': 'Clientes',
      'agendamentos': 'Agendamentos',
      'servicos': 'Serviços',
      'relatorios': 'Relatórios',
      'nova': 'Nova',
      'editar': 'Editar'
    };
    
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }



  /**
   * Verificar tamanho da tela para ajustar sidebar
   */
  private checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.sidebarVisible = false;
    }
  }

  /**
   * Toggle da sidebar
   */
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  /**
   * Toggle da sidebar mobile
   */
  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  /**
   * Navegar para perfil
   */
  navigateToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  /**
   * Navegar para configurações
   */
  navigateToSettings(): void {
    this.router.navigate(['/configuracoes']);
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obter nome do usuário atual
   */
  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.username || 'Usuário';
  }

  /**
   * Obter inicial do usuário
   */
  getUserInitial(): string {
    const name = this.getCurrentUserName();
    return name.charAt(0).toUpperCase();
  }
} 