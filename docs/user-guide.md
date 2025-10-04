# CIVWATCH User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Platform Overview](#platform-overview)
5. [Core Features](#core-features)
6. [Configuration](#configuration)
7. [Dashboard Usage](#dashboard-usage)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Data Export & Reports](#data-export--reports)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [FAQ](#faq)

## Introduction

Welcome to CIVWATCH, the next-generation civic surveillance and transparency platform. This user guide will help you navigate the platform, understand its features, and make the most of its capabilities for promoting democratic accountability.

### What is CIVWATCH?

CIVWATCH is an open-source platform that provides:
- **Real-time monitoring** of civic proceedings and public data
- **AI-powered analysis** for sentiment, bias, and anomaly detection
- **Transparent reporting** with comprehensive audit trails
- **Community-driven** transparency initiatives

## Installation

### Prerequisites

Before installing CIVWATCH, ensure you have:
- **Node.js** >= 18.0.0
- **Python** >= 3.9.0
- **Docker** >= 24.0.0 (optional, for containerized deployment)
- **PostgreSQL** >= 14.0 (or use Docker Compose)
- **Redis** >= 6.0 (or use Docker Compose)

### Quick Installation

#### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Start all services
docker-compose up -d

# Access the platform at http://localhost:3000
```

#### Manual Installation

```bash
# Clone the repository
git clone https://github.com/POWDER-RANGER/CIVWATCH.git
cd CIVWATCH

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:migrate

# Start development servers
npm run dev
```

### Verification

To verify your installation:

```bash
# Check service status
npm run status

# Run health check
curl http://localhost:3000/api/health
```

## Getting Started

### First-Time Setup

1. **Create an Account**
   - Navigate to `http://localhost:3000/register`
   - Fill in your details
   - Verify your email address

2. **Configure Your Dashboard**
   - Log in to your account
   - Go to Settings > Dashboard
   - Select your monitoring preferences

3. **Add Data Sources**
   - Navigate to Sources > Add New
   - Configure API connections or upload data
   - Set refresh intervals

### Your First Monitoring Session

1. **Select a Data Source**
   - Click "New Monitoring Session"
   - Choose from available sources
   - Configure monitoring parameters

2. **Start Monitoring**
   - Click "Start Monitoring"
   - View real-time data streams
   - Observe AI analysis results

3. **Review Results**
   - Check the Analytics Dashboard
   - Export reports
   - Set up alerts

## Platform Overview

### Dashboard Layout

- **Top Navigation**: Quick access to main features
- **Left Sidebar**: Data sources, monitoring sessions, reports
- **Main Panel**: Real-time data visualization
- **Right Sidebar**: Alerts, notifications, quick actions
- **Bottom Bar**: System status and quick stats

### Key Components

#### 1. Monitoring Center
Real-time surveillance of civic proceedings and data streams.

#### 2. Analytics Dashboard
Visualize trends, patterns, and insights from collected data.

#### 3. Alert Management
Configure and manage automated alerts for anomalies.

#### 4. Report Generator
Create custom transparency reports with data visualizations.

## Core Features

### Real-Time Monitoring

**Live Stream Analysis**
- Monitor public proceedings in real-time
- AI-powered transcription and analysis
- Automatic flagging of key moments

**Usage:**
```bash
# Start a monitoring session
npm run monitor:start --source="city-council" --date="2025-10-04"
```

### AI-Powered Analysis

**Sentiment Analysis**
- Track public opinion trends
- Identify sentiment shifts
- Compare across time periods

**Bias Detection**
- Multi-dimensional bias scoring
- Source credibility analysis
- Fairness metrics

**Anomaly Detection**
- Automatic pattern recognition
- Unusual activity alerts
- Historical comparison

### Data Visualization

**Interactive Charts**
- D3.js-powered visualizations
- Customizable layouts
- Export to PNG, SVG, or PDF

**Real-Time Updates**
- Sub-second data refresh
- WebSocket connections
- Progressive loading

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application
CIVWATCH_ENV=production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/civwatch
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=your-openai-api-key
TWILIO_API_KEY=your-twilio-api-key

# Security
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-encryption-key
SESSION_SECRET=your-session-secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### User Preferences

Configure personal preferences in the Settings menu:

1. **Display Settings**
   - Theme (light/dark)
   - Layout preferences
   - Font size

2. **Notification Settings**
   - Email notifications
   - Push notifications
   - Alert thresholds

3. **Data Settings**
   - Data retention period
   - Export formats
   - Privacy controls

## Dashboard Usage

### Main Dashboard

The main dashboard provides an overview of:
- **Active Monitoring Sessions**: Currently running monitors
- **Recent Alerts**: Latest anomalies and flagged items
- **Statistics**: Key metrics and trends
- **Quick Actions**: Start monitoring, create reports, view alerts

### Analytics Dashboard

Access detailed analytics:

1. Click "Analytics" in the top navigation
2. Select time range and data source
3. Choose visualization type
4. Apply filters and groupings
5. Export or share results

### Customization

**Add Widgets**
- Drag and drop from widget library
- Resize and reposition
- Configure data sources

**Create Custom Views**
- Save dashboard layouts
- Share with team members
- Set as default view

## Monitoring & Alerts

### Creating Monitors

1. Navigate to Monitoring > New Monitor
2. Select data source
3. Configure monitoring parameters:
   - Frequency: Real-time, hourly, daily
   - Filters: Keywords, sentiment, sources
   - Analysis: Sentiment, bias, anomalies
4. Set alert conditions
5. Save and activate

### Alert Configuration

**Alert Types:**
- **Threshold Alerts**: Triggered when metrics exceed limits
- **Anomaly Alerts**: Unusual patterns detected
- **Event Alerts**: Specific events occur
- **Scheduled Alerts**: Regular status reports

**Notification Channels:**
- Email
- SMS (via Twilio)
- Push notifications
- Webhook
- Discord/Slack integration

### Alert Management

View and manage alerts:

```bash
# List active alerts
npm run alerts:list

# Acknowledge alert
npm run alerts:ack --id=alert-123

# Disable alert
npm run alerts:disable --id=alert-123
```

## Data Export & Reports

### Exporting Data

**Export Formats:**
- CSV: Tabular data export
- JSON: Structured data export
- PDF: Report-style export
- Excel: Spreadsheet format

**Export Process:**
1. Select data to export
2. Choose format
3. Apply filters (optional)
4. Download or send via email

### Generating Reports

**Report Types:**
- **Summary Reports**: High-level overview
- **Detailed Reports**: In-depth analysis
- **Transparency Reports**: Public accountability
- **Custom Reports**: User-defined templates

**Creating Reports:**

```bash
# Generate report
npm run report:generate --type=summary --period=monthly

# Schedule report
npm run report:schedule --frequency=weekly --recipients=team@example.com
```

## Troubleshooting

### Common Issues

#### Installation Problems

**Issue: Dependencies fail to install**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue: Database connection fails**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall settings

#### Runtime Errors

**Issue: Dashboard not loading**
- Check browser console for errors
- Verify API server is running
- Clear browser cache

**Issue: Real-time updates not working**
- Check WebSocket connection
- Verify Redis is running
- Check firewall settings

### Getting Help

If you encounter issues:

1. **Check Documentation**: Search our docs
2. **Community Forum**: Ask on Discord
3. **GitHub Issues**: Report bugs
4. **Email Support**: support@civwatch.org

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=civwatch:*
npm run dev
```

## Best Practices

### Security

1. **Use Strong Passwords**: Enable 2FA
2. **Keep Updated**: Regular security patches
3. **Limit Access**: Role-based permissions
4. **Audit Logs**: Regular review
5. **Data Encryption**: Enable for sensitive data

### Performance

1. **Optimize Queries**: Use filters and pagination
2. **Cache Results**: Enable Redis caching
3. **Limit Monitoring**: Don't over-monitor
4. **Schedule Reports**: Off-peak hours
5. **Archive Data**: Regular cleanup

### Data Quality

1. **Validate Sources**: Verify data accuracy
2. **Clean Data**: Regular data quality checks
3. **Document Changes**: Track modifications
4. **Backup Regularly**: Automated backups
5. **Test Alerts**: Verify alert accuracy

## FAQ

### General Questions

**Q: Is CIVWATCH free to use?**
A: Yes, CIVWATCH is open-source and free under the MIT License.

**Q: Can I use CIVWATCH for commercial purposes?**
A: Yes, the MIT License permits commercial use.

**Q: What data sources does CIVWATCH support?**
A: CIVWATCH supports APIs, web scraping, RSS feeds, CSV uploads, and custom integrations.

### Technical Questions

**Q: What are the minimum system requirements?**
A: 4GB RAM, 10GB disk space, modern web browser.

**Q: Can I deploy CIVWATCH on cloud platforms?**
A: Yes, supports AWS, GCP, Azure, Heroku, and others.

**Q: How do I contribute to CIVWATCH?**
A: See our [Contributing Guide](../CONTRIBUTING.md).

### Privacy & Security

**Q: How is my data protected?**
A: End-to-end encryption, zero-knowledge architecture, GDPR compliant.

**Q: Can I self-host CIVWATCH?**
A: Yes, full self-hosting support with Docker.

**Q: What analytics data is collected?**
A: Only anonymous usage statistics, with full opt-out available.

---

**Need more help?** Join our [Discord community](https://discord.gg/civwatch) or email [support@civwatch.org](mailto:support@civwatch.org).

**Last Updated**: October 2025  
**Version**: 1.0.0  
**License**: MIT
