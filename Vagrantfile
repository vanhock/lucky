ENV["LC_ALL"] = "en_US.UTF-8"

Vagrant.configure(2) do |config|
    config.vm.provider "virtualbox" do |v|
        v.memory = 2048
    end

    config.vm.box = "ubuntu/xenial64"
    config.vm.network "private_network", ip: "192.168.134.143"
    config.vm.hostname = "perfect-pixel.local"

    config.ssh.insert_key = false
    config.ssh.forward_agent = true

    config.hostsupdater.aliases = [
        "perfect-pixel.local"
    ]

    config.vm.synced_folder ".", "/perfect-pixel-app", type: "nfs"

    ansible_command = Vagrant::Util::Platform.windows? ? "ansible_local" : "ansible"
    is_local_ansible = ansible_command == "ansible_local"

    config.vm.provision ansible_command do |ansible|
        if is_local_ansible
            ansible.provisioning_path = "/perfect-pixel-app/ansible"
            ansible.limit = "local"
            ansible.inventory_path = "/perfect-pixel-app/ansible/hosts"
            ansible.playbook = "/perfect-pixel-app/ansible/playbook.yml"
            ansible.galaxy_role_file = "/perfect-pixel-app/ansible/requirements.yml"
            ansible.galaxy_roles_path = "/home/vagrant/.ansible/roles"
            ansible.galaxy_command = "sudo ansible-galaxy install --role-file=%{role_file} --roles-path=%{roles_path} --force --ignore-certs --ignore-errors -vvv"
        else
            ansible.playbook = "./ansible/playbook.yml"
            ansible.limit = "vagrant"
            ansible.inventory_path = "./ansible/hosts"
        end
      end

    config.trigger.after [:up, :reload] do |trigger|
        trigger.name = "Start backend daemon"
        trigger.run_remote = {inline: "systemctl start pixel-perfect-web.service"}
    end
end
