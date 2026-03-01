# Git-Crypt Setup Guide for Secure Configuration Management

This guide walks you through setting up git-crypt for your repository to encrypt sensitive configuration files before they are committed to version control. This approach allows you to commit actual API keys and secrets to your repository while keeping them encrypted at rest, solving the configuration management problem that plagues many projects where developers must manually create config files or use complex secrets management systems.

## Understanding the Problem Git-Crypt Solves

When you build applications that require API keys, database credentials, or other secrets, you face a difficult choice. You could commit a config template with placeholder values and require each developer to manually create their own config file with real credentials. This approach works but creates friction—new developers must track down credentials, documentation gets out of date, and different environments might use inconsistent configurations. Alternatively, you could commit the actual config file with real secrets to version control, but this exposes those secrets to anyone who can access your repository, including former team members or anyone who gains unauthorized access to your GitHub account.

Git-crypt provides an elegant middle ground. It encrypts specified files before Git commits them, so your repository contains the actual configuration files with real secrets, but those files are encrypted using strong cryptography. Only people who possess the decryption key can read the sensitive values. This means your repository becomes self-contained—a fresh clone and a single unlock command gives a new developer a fully configured environment. The encrypted files live in version control so you get all the benefits of Git including change history, branching, and merging, but the secrets remain protected.

## Installation and Prerequisites

Before you can use git-crypt, you need to install the git-crypt command-line tool on your development machine. Git-crypt is written in C++ and available for all major operating systems through their standard package managers.

On macOS using Homebrew, install git-crypt by running `brew install git-crypt` in your terminal. Homebrew will download the latest stable version and install it to a location in your PATH so you can run the git-crypt command from any directory.

On Ubuntu or Debian Linux distributions, install git-crypt using the apt package manager by running `sudo apt-get update` to refresh your package lists followed by `sudo apt-get install git-crypt`. The package is maintained in the main repositories for recent Ubuntu releases, so this should work out of the box on Ubuntu 20.04 and later.

On other Linux distributions, consult your distribution's package manager documentation. The package is usually named git-crypt and available in standard repositories. If your distribution doesn't package git-crypt, you can build it from source by cloning the repository from GitHub and following the compilation instructions in their README.

On Windows, the recommended approach is to use Windows Subsystem for Linux and install git-crypt through the Linux package manager within WSL. Alternatively, you can build from source using MinGW or Cygwin, though this requires more setup effort.

Once git-crypt is installed, verify it works by running `git-crypt --version`. You should see version information displayed. At the time of writing, version 0.7.0 is current, but any version from 0.6.0 forward should work correctly for the configurations described in this guide.

You will also need GPG (GNU Privacy Guard) installed if you plan to use GPG keys for managing access to the encrypted repository. Most Linux distributions ship with GPG installed. On macOS, install it with `brew install gnupg`. On Windows, use Gpg4win which provides a complete GPG toolchain including a graphical interface for key management.

## Initializing Git-Crypt in Your Repository

Navigate to the root directory of your Git repository where you want to enable encryption. This must be an existing Git repository—git-crypt works as an extension to Git and requires a Git repository to function. If you haven't initialized Git yet, run `git init` first.

Initialize git-crypt in your repository by running `git-crypt init`. This command creates a random symmetric encryption key and stores it in `.git/git-crypt/keys/default`. The key never leaves your repository's .git directory and is not committed to version control. This symmetric key is what git-crypt uses to actually encrypt your files—it's fast and secure for encrypting potentially large configuration files.

The init command also sets up git-crypt's Git filters and attributes. These filters tell Git to run files through git-crypt's encryption when staging them and through decryption when checking them out. This integration is transparent once configured—you edit files normally and Git handles the encryption automatically.

After initialization, you need to specify which files should be encrypted. Create or edit the `.gitattributes` file in your repository root. The gitattributes file uses pattern matching to specify which files get which attributes, and git-crypt uses this mechanism to determine what to encrypt.

For a configuration file named `api-config.yml` that should be encrypted, add this line to `.gitattributes`:

```
api-config.yml filter=git-crypt diff=git-crypt
```

The `filter=git-crypt` attribute tells Git to run this file through git-crypt's clean filter when staging and smudge filter when checking out. The `diff=git-crypt` attribute tells Git to decrypt files before showing diffs, so `git diff` shows you the actual changes rather than encrypted binary differences.

You can use wildcard patterns to encrypt multiple files. For example, to encrypt all YAML files in a secrets directory:

```
secrets/*.yml filter=git-crypt diff=git-crypt
secrets/*.yaml filter=git-crypt diff=git-crypt
```

Be careful with wildcards that might match too broadly. You probably don't want to encrypt your test fixtures or example configs, only files containing actual secrets.

Add and commit your `.gitattributes` file so the encryption configuration is versioned:

```bash
git add .gitattributes
git commit -m "feat(config): configure git-crypt for sensitive config files"
```

Now create or modify your sensitive configuration file. For this example, we'll create an API configuration file with real credentials:

```yaml
# api-config.yml
services:
  openai:
    api_key: "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
    organization: "org-xyz789"
    
  stripe:
    
    publishable_key: "pk_live_qrstuvwxyz9876543210"
    
  sendgrid:
    
database:
  production:
    host: "prod-db.example.com"
    username: "app_user"
    password: "YourSecurePasswordHere123!"
```

When you add this file to Git, git-crypt automatically encrypts it:

```bash
git add api-config.yml
git commit -m "feat(config): add production API configuration"
```

At this point, your repository contains an encrypted version of the file. If someone clones your repository without the decryption key, they'll see encrypted binary data rather than your actual API keys.

## Verifying Encryption Works Correctly

To verify that git-crypt is actually encrypting your files, you can examine what Git has stored in the repository. From your repository's root directory, run:

```bash
git show HEAD:api-config.yml
```

This command shows the version of the file as stored in your most recent commit. If git-crypt is working correctly, you should see binary garbage starting with the git-crypt file format header. You won't be able to read the actual API keys because they're encrypted.

Compare this to viewing the file in your working directory:

```bash
cat api-config.yml
```

This should show the decrypted file with your actual API keys visible. The file in your working directory is automatically decrypted by git-crypt because you have the key in your `.git/git-crypt/keys/default` directory.

This demonstrates the core git-crypt workflow. When you run `git add`, the clean filter encrypts the file before storing it in Git's object database. When you run `git checkout` or switch branches, the smudge filter decrypts the file when writing it to your working directory. You never see the encrypted versions unless you explicitly ask Git to show you the stored content.

## Managing Access with GPG Keys

The setup described so far works well for solo developers, but it has a limitation—the encryption key lives only in your `.git` directory. If you lose your repository or your hard drive fails, you lose access to your encrypted files. Additionally, you can't easily grant access to other developers because the symmetric key is a single shared secret.

Git-crypt solves this with GPG-based key management. You can export the symmetric encryption key in a form encrypted with your GPG public key. This gives you a way to back up access to your encrypted files and to grant access to specific people without sharing a single secret.

First, ensure you have a GPG key pair. Check if you already have one by running:

```bash
gpg --list-keys
```

If this shows one or more keys, you can use an existing key. If you don't have a GPG key yet, generate one:

```bash
gpg --full-generate-key
```

Select RSA and RSA for the key type, choose a key size of 4096 bits for maximum security, set an expiration period (two years is reasonable for most purposes), and provide your name and email address. GPG will generate your keypair, which may take a few minutes depending on system entropy.

Once you have a GPG key, add it to git-crypt so it can unlock your repository. Run:

```bash
git-crypt add-gpg-user YOUR_EMAIL@example.com
```

Replace YOUR_EMAIL@example.com with the email address associated with your GPG key. Git-crypt will export the symmetric encryption key, encrypt it with your GPG public key, and commit this encrypted key export to the repository in the `.git-crypt` directory.

Now when you clone the repository fresh or share it with another machine where you have your GPG private key, you can unlock it using:

```bash
git-crypt unlock
```

Git-crypt will locate the encrypted key export in the repository, decrypt it using your GPG private key, and install the resulting symmetric key in your `.git/git-crypt/keys/default` directory. From that point forward, all encrypted files are automatically decrypted when you check them out.

To grant access to another developer, they need to generate their own GPG key pair and share their public key with you. Import their public key into your GPG keyring:

```bash
gpg --import their-public-key.asc
```

Then add their key to the repository:

```bash
git-crypt add-gpg-user their_email@example.com
```

Commit and push this change. When they clone the repository, they run `git-crypt unlock` and git-crypt will decrypt the key export using their private GPG key, granting them access to the encrypted files.

## Alternative: Symmetric Key Export for CI/CD

For continuous integration systems or automated deployments where GPG key management is cumbersome, you can export the symmetric key directly. This is less secure than GPG-based access because the key is a single shared secret, but it's often necessary for CI systems.

Export the symmetric key to a file:

```bash
git-crypt export-key ../git-crypt-key
```

This creates a file containing the raw symmetric encryption key. Store this file securely—anyone with this file can decrypt your repository. Do not commit this file to Git. Store it in a secrets management system like HashiCorp Vault, AWS Secrets Manager, or GitHub Secrets.

In your CI system, retrieve the key from your secrets management system and unlock the repository:

```bash
git-crypt unlock /path/to/git-crypt-key
```

This unlocks the repository using the symmetric key directly without requiring GPG. Configure your CI system to securely delete the key file after use to prevent it from persisting in the CI environment.

## Working with Encrypted Repositories

Once git-crypt is configured, your daily workflow remains mostly unchanged. You edit configuration files normally. Git automatically encrypts them when you commit and decrypts them when you check out. There are a few considerations to keep in mind.

If you clone the repository on a new machine or a colleague clones it for the first time, the encrypted files will remain encrypted until you run `git-crypt unlock`. If someone tries to use the configuration files before unlocking, they'll encounter binary garbage and the application will fail to parse the config. Train your team to run `git-crypt unlock` immediately after cloning.

When you switch branches that have different encrypted content, git-crypt handles the decryption correctly. However, if you have unsaved changes to encrypted files and try to switch branches, Git may refuse the checkout to avoid losing changes, just as it would with any modified file.

Merge conflicts in encrypted files are handled the same as any other files, but resolving them requires extra care. Git will show you the decrypted versions in the conflict markers, so you can resolve conflicts based on the actual content. After resolving the conflict and committing, git-crypt will re-encrypt the merged result.

Be aware that git-crypt doesn't encrypt your entire repository history retroactively. If you previously committed secrets in plain text, they remain visible in your Git history even after you enable git-crypt. You would need to rewrite history with `git filter-branch` or BFG Repo-Cleaner to remove historical secrets, which is a destructive operation that requires coordination with all repository users.

## Best Practices and Security Considerations

Git-crypt provides strong encryption for files at rest in your repository, but it's not a complete security solution. You should understand its limitations and use it as part of a comprehensive security strategy.

The encryption is only as strong as your key management. If you export the symmetric key and store it insecurely, or if someone gains access to your GPG private key, they can decrypt your files. Use strong passphrases on your GPG keys and store exported symmetric keys only in proper secrets management systems.

Git-crypt encrypts files in your repository but not in your working directory. Anyone with access to your laptop can read the decrypted files if your repository is unlocked. Use full-disk encryption on your development machines to protect against physical theft, and lock your screen when you step away from your computer.

Consider what to encrypt carefully. Configuration templates and example configs should not be encrypted because developers need to see their structure. Only encrypt files containing actual secrets. Your `.gitattributes` file documents what's encrypted, so reviewing it tells you where secrets live in your codebase.

Rotate secrets periodically even when using git-crypt. Encryption protects secrets at rest, but secrets still need rotation as part of security hygiene. When rotating a secret, update the encrypted file and commit the change. The old secret remains visible in Git history, so if a secret was compromised, rotation alone doesn't eliminate the exposure—you need to revoke the old credential.

Audit who has access to your repository and your git-crypt keys. Git-crypt uses your repository's access control (GitHub permissions, GitLab access levels) plus GPG key management. Review both access lists regularly. When someone leaves the team, revoke their repository access and consider rotating secrets they had access to.

Use git-crypt for application secrets and configuration but not for personal credentials like SSH keys or GPG keys themselves. Those belong in your home directory and should never be committed to any repository, encrypted or not.

## Integration with Your README Documentation

Your repository's README should document that git-crypt is in use and explain how to unlock the repository. Add a section like this to your README:

```markdown
## Configuration

This repository uses git-crypt to encrypt sensitive configuration files. After cloning, you must unlock the repository to access API keys and credentials.

### First-Time Setup

1. Install git-crypt: `brew install git-crypt` (macOS) or `apt-get install git-crypt` (Ubuntu)

2. Unlock the repository using GPG:
   ```bash
   git-crypt unlock
   ```
   
   This requires your GPG private key. Contact a repository administrator if you don't have access.

3. Alternatively, unlock with an exported key:
   ```bash
   git-crypt unlock /path/to/git-crypt-key
   ```
   
   The key file should be obtained from your team's secrets management system.

### Verifying Unlock Status

Check if the repository is unlocked:

```bash
git-crypt status
```

This shows which files are encrypted and whether you have access to decrypt them.

### Adding New Secrets

To encrypt additional configuration files:

1. Add the file pattern to `.gitattributes`:
   ```
   path/to/secret.yml filter=git-crypt diff=git-crypt
   ```

2. Commit the updated `.gitattributes`

3. Add and commit the secret file—git-crypt will encrypt it automatically
```

This documentation helps new team members understand they need to unlock the repository and provides clear instructions for doing so.

## Troubleshooting Common Issues

If git-crypt unlock fails with a GPG error, the most common cause is that your GPG private key isn't available or the passphrase is incorrect. Verify your GPG key is accessible with `gpg --list-secret-keys`. If you're on a new machine, you may need to import your private key from a backup.

If files appear as binary garbage after unlocking, you may have unlocked the repository after checking out the files. Git-crypt's smudge filter runs during checkout, not during unlock. After unlocking, run `git checkout HEAD -- path/to/file` to force Git to re-checkout the file through the filters.

If a file that should be encrypted isn't being encrypted, check your `.gitattributes` file. The pattern must match the file path exactly, and the attributes line must come before any wildcard patterns that might override it. Test pattern matching with `git check-attr -a path/to/file`.

If merge conflicts seem to contain binary data, you may be trying to merge branches while the repository is locked. Unlock the repository first so Git can show you the decrypted conflict markers.

If someone reports they can't access encrypted files despite having a GPG key added, verify their key was correctly added with `git-crypt status -e`. This shows which GPG keys can unlock the repository. If their key isn't listed, run `git-crypt add-gpg-user their_email@example.com` again and commit the result.

## Summary and Next Steps

Git-crypt solves the configuration management problem by allowing you to commit encrypted secrets to version control. This gives you the benefits of Git's version control and distribution while keeping sensitive data protected. Setting up git-crypt requires initializing it in your repository, specifying which files to encrypt in `.gitattributes`, and managing access via GPG keys or exported symmetric keys.

For your OSINT API automation project or any other repository with API keys and credentials, follow these steps to implement git-crypt:

First, install git-crypt on your development machine using your package manager. Second, navigate to your repository and run `git-crypt init` to initialize encryption. Third, add the files you want encrypted to `.gitattributes` using the filter and diff attributes. Fourth, add your GPG key with `git-crypt add-gpg-user` so you can unlock the repository on other machines. Fifth, create your configuration file with actual secrets and commit it—git-crypt will encrypt it automatically. Finally, document the unlock process in your README so collaborators know they need to run git-crypt unlock after cloning.

Remember that git-crypt is one layer of security in a comprehensive security strategy. Use it in combination with proper access controls on your repository, secure GPG key management, full-disk encryption on development machines, and regular secret rotation to maintain a strong security posture for your sensitive configuration data.
