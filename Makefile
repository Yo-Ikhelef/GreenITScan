# Makefile for Git and Docker operations

# Default target
.PHONY: help
help:
	@echo "Usage:"
	@echo "  make new-branch name=<branch-name>      Create a new branch with the specified name"
	@echo "  make delete-branch 					 List all the branches, select one to delete it"
	@echo "  make list-branches                      List all local branches"
	@echo "  make list-branches-remote               List all remote branches"
	@echo "  make checkout                           Switch to a branch"
	@echo "  make commit message=<commit-message>    Commit changes with a message"
	@echo "  make push                               Push changes to the remote repository"
	@echo "  make pull                               Pull changes from the remote repository"
	@echo "  make merge name=<branch-name>           Merge the specified branch into the current branch"
	@echo "  make status                             Show the Git status"
	@echo "  make build                              Build Docker images"
	@echo "  make up                                 Start Docker containers in detached mode"
	@echo "  make stop                               Stop Docker containers"
	@echo "  make down                               Stop and remove Docker containers"
	@echo "  make exec container=<container-name>    Execute bash in the specified container"
	@echo "  make backend 						     Enter the backend container"
	@echo "  make frontend                           Enter the frontend container"
	@echo "  make database 						     Enter the database container"
	@echo "  make recreate-schema                    Recreate the database schema"
	@echo "  make fixtures                           Load database fixtures"
	@echo "  make update-backend                     Update the backend dependencies and database"
	@echo "  make reset-backend                      Reset the backend database and schema"
	@echo "  make install                            Build and start Docker containers, update backend"
	@echo "  make reset-all                          Reset all Docker containers and backend"
	@echo "  make restart                            Restart Docker containers"
	@echo "  make logs                               Show Docker logs in real-time"

# Git Targets
.PHONY: new-branch delete-branch list-branches list-branches-remote commit push pull status merge checkout
new-branch:
	@if [ -z "$(name)" ]; then \
	  echo "Error: 'name' variable is not set. Use 'make new-branch name=<branch-name>'"; \
	  exit 1; \
	fi; \
	sanitized_name=$$(echo $(name) | tr ' ' '-'); \
	git checkout -b "$$sanitized_name"; \
	git push -u origin "$$sanitized_name"; \
	echo "New branch '$$sanitized_name' created and pushed to GitHub."

delete-branch:
	 @bash -c '\
	  echo "Available branches:"; \
	  tput bold; \
	  tput setaf 2; \
	  branches=$$(git for-each-ref --format="%(refname:short)" refs/heads | sort -u); \
	  select branch in $$branches; do \
	   tput sgr0; \
	   if [ -n "$$branch" ]; then \
		tput bold; \
		tput setaf 3; \
		read -p "Are you sure you want to delete branch \"$$branch\"? (y/n): " confirm; \
		tput sgr0; \
		if [ "$$confirm" = "y" ]; then \
		 if [ "$$branch" = "main" ]; then \
		  echo "Error: Deleting the 'main' branch is not allowed."; \
		  exit 1; \
		 fi; \
		 current_branch=$$(git rev-parse --abbrev-ref HEAD); \
		 if [ "$$current_branch" = "$$branch" ]; then \
		  echo "Switching to 'main' branch to delete '$$branch'..."; \
		  if ! git diff-index --quiet HEAD --; then \
		   echo "Uncommitted changes detected. Stashing changes..."; \
		   git stash push -m "Auto-stash before deleting branch '$$branch'" || { echo "Error: Failed to stash changes."; exit 1; }; \
		   stashed=true; \
		  else \
		   stashed=false; \
		  fi; \
		  git checkout main || { echo "Error: Failed to switch to 'main' branch."; exit 1; }; \
		 fi; \
		 if [ "$(force)" = "true" ]; then \
		  echo "Force deleting branch '$$branch'..."; \
		  git branch -D "$$branch" || exit 1; \
		  git push origin --delete "$$branch" || true; \
		  echo "Branch '$$branch' force deleted locally and remotely."; \
		 else \
		  echo "Deleting branch '$$branch'..."; \
		  git branch -d "$$branch" || exit 1; \
		  git push origin --delete "$$branch" || true; \
		  echo "Branch '$$branch' deleted locally and remotely."; \
		 fi; \
		 if [ "$$stashed" = "true" ]; then \
		  echo "Restoring stashed changes..."; \
		  git stash pop || { echo "Warning: Failed to apply stashed changes. They remain in the stash list."; }; \
		 fi; \
		 break; \
		else \
		 echo "Cancelled deletion of branch \"$$branch\"."; \
		 exit 0; \
		fi; \
	   else \
		tput setaf 1; \
		echo "Invalid selection. Please try again."; \
		tput sgr0; \
	   fi; \
	  done'


list-branches:
	@git branch
	@echo "Listed all local branches."

list-branches-remote:
	@git branch -r
	@echo "Listed all remote branches."

checkout:
	@bash -c '\
		echo "Available branches:"; \
		tput bold; \
		tput setaf 2; \
		branches=$$(git for-each-ref --format="%(refname:short)" refs/heads refs/remotes | sort -u); \
		select branch in $$branches; do \
			tput sgr0; \
			if [ -n "$$branch" ]; then \
				tput bold; \
				tput setaf 3; \
				read -p "Are you sure you want to switch to branch \"$$branch\"? (y/n): " confirm; \
				tput sgr0; \
				if [ "$$confirm" = "y" ]; then \
					echo "Switching to branch \"$$branch\"..."; \
					git checkout "$$branch" || { tput setaf 1; echo "Error: Failed to checkout to branch \"$$branch\"."; tput sgr0; exit 1; }; \
					tput bold; \
					tput setaf 2; \
					echo "Successfully switched to branch \"$$branch\"!"; \
					tput sgr0; \
					break; \
				else \
					echo "Cancelled checkout to branch \"$$branch\"."; \
					exit 0; \
				fi; \
			else \
				tput setaf 1; \
				echo "Invalid selection. Please try again."; \
				tput sgr0; \
			fi; \
		done'

commit:
	@if [ -z "$(message)" ]; then \
		echo "Error: 'message' variable is not set. Use 'make commit message=<commit-message>'"; \
		exit 1; \
	fi
	@git add .
	@git commit -m "$(message)"
	@echo "Changes committed with message: $(message)."

push:
	@git push || { echo "Error: Push failed."; exit 1; }
	@echo "Changes pushed to the remote repository."

pull:
	@git pull || { echo "Error: Pull failed."; exit 1; }
	@echo "Changes pulled from the remote repository."

status:
	@git status
	@echo "Git status displayed."

merge:
	@if [ -z "$(name)" ]; then \
		echo "Error: 'name' variable is not set. Use 'make merge name=<branch-name>'"; \
		exit 1; \
	fi
	@git merge $(name) || { \
		echo "Merge conflict detected. Resolve conflicts and commit the merge manually."; \
		exit 1; \
	}
	@echo "Branch '$(name)' merged successfully."

# Docker Targets
.PHONY: build up stop down exec backend frontend database recreate-schema fixtures update-backend reset-backend install reset-all restart logs
build:
	docker compose build
	@echo "Docker images built."

up:
	docker compose up -d
	@echo "Docker containers started in detached mode."

stop:
	docker compose stop
	@echo "Docker containers stopped."

down:
	docker compose down
	@echo "Docker containers stopped and removed."

exec:
	@if [ -z "$(container)" ]; then \
		echo "Error: 'container' variable is not set. Use 'make exec container=<container-name>'"; \
		exit 1; \
	fi
	@docker exec -ti $(container) bash
	@echo "Entered container: $(container)."

backend:
	@docker exec -ti api_backend bash
	@echo "Entered backend container: api-backend."

frontend:
	@docker exec -ti quasar-frontend bash
	@echo "Entered frontend container: quasar-frontend."

database:
	@docker exec -ti mariadb_database bash
	@echo "Entered database container: mariadb_database."

recreate-schema:
	@docker exec -ti api_backend php bin/console doctrine:schema:drop --force --full-database
	@echo "Database schema dropped."
	@docker exec -ti api_backend php bin/console doctrine:schema:update --force
	@echo "Database schema recreated."

fixtures:
	@docker exec -ti api_backend php bin/console hautelook:fixtures:load -vvv
	@echo "Database fixtures loaded."

logs:
	docker compose logs -f

update-backend:
	docker compose exec backend composer install
	docker compose exec backend php bin/console doctrine:database:create --if-not-exists
	docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction

reset-backend:
	docker compose exec backend composer install
	docker compose exec backend rm -rf var/cache
	docker compose exec backend php bin/console doctrine:database:drop --force --if-exists
	docker compose exec backend php bin/console doctrine:database:create
	docker compose exec backend php bin/console doctrine:schema:update --force

install:
	make build
	make up
	make update-backend

reset-all:
	make down
	docker volume rm greenitscan_mariadb_data || true
	make up
	make reset-backend

restart:
	make down
	make build
	make up
