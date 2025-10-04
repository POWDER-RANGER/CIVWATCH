#!/usr/bin/env python3
"""
CIVWATCH Data Ingestion Demo

Demonstrates how to ingest civic data from various sources,
process it through the analytics pipeline, and prepare for ML analysis.

Usage:
    python demo/data_ingestion_demo.py
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import json

# TODO: Replace with actual CIVWATCH imports once modules are implemented
# from civwatch.data import DataIngester
# from civwatch.analytics import DataAnalyzer
# from civwatch.ml import SentimentModel


def generate_sample_civic_data(num_records=100):
    """
    Generate sample civic data for demonstration purposes.
    In production, this would be replaced with actual data sources.
    """
    print("📊 Generating sample civic data...")
    
    dates = [datetime.now() - timedelta(days=x) for x in range(num_records)]
    
    data = {
        'date': dates,
        'council_votes': np.random.randint(0, 2, num_records),
        'public_attendance': np.random.randint(10, 500, num_records),
        'budget_allocation': np.random.uniform(10000, 1000000, num_records),
        'transparency_score': np.random.uniform(0.3, 1.0, num_records),
        'sentiment': np.random.choice(['positive', 'neutral', 'negative'], num_records)
    }
    
    df = pd.DataFrame(data)
    print(f"✅ Generated {len(df)} records")
    return df


def analyze_data(df):
    """
    Perform basic analytics on the civic data.
    """
    print("\n🔍 Analyzing data...")
    
    # Calculate summary statistics
    avg_attendance = df['public_attendance'].mean()
    avg_transparency = df['transparency_score'].mean()
    total_budget = df['budget_allocation'].sum()
    
    print(f"  Average Public Attendance: {avg_attendance:.0f}")
    print(f"  Average Transparency Score: {avg_transparency:.2f}")
    print(f"  Total Budget Allocation: ${total_budget:,.2f}")
    
    # Sentiment distribution
    sentiment_counts = df['sentiment'].value_counts()
    print(f"\n  Sentiment Distribution:")
    for sentiment, count in sentiment_counts.items():
        print(f"    {sentiment.capitalize()}: {count} ({count/len(df)*100:.1f}%)")
    
    return {
        'avg_attendance': avg_attendance,
        'avg_transparency': avg_transparency,
        'total_budget': total_budget,
        'sentiment_distribution': sentiment_counts.to_dict()
    }


def visualize_data(df):
    """
    Create visualizations of the civic data.
    """
    print("\n📈 Creating visualizations...")
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('CIVWATCH Data Analysis Dashboard', fontsize=16, fontweight='bold')
    
    # Public attendance over time
    axes[0, 0].plot(df['date'], df['public_attendance'], marker='o', linestyle='-', alpha=0.7)
    axes[0, 0].set_title('Public Attendance Trend')
    axes[0, 0].set_xlabel('Date')
    axes[0, 0].set_ylabel('Attendance')
    axes[0, 0].grid(True, alpha=0.3)
    
    # Transparency score distribution
    axes[0, 1].hist(df['transparency_score'], bins=20, color='skyblue', edgecolor='black')
    axes[0, 1].set_title('Transparency Score Distribution')
    axes[0, 1].set_xlabel('Transparency Score')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].grid(True, alpha=0.3)
    
    # Sentiment pie chart
    sentiment_counts = df['sentiment'].value_counts()
    axes[1, 0].pie(sentiment_counts.values, labels=sentiment_counts.index, 
                    autopct='%1.1f%%', startangle=90, colors=['#66c2a5', '#fc8d62', '#8da0cb'])
    axes[1, 0].set_title('Sentiment Distribution')
    
    # Budget allocation over time
    axes[1, 1].scatter(df['date'], df['budget_allocation'], 
                       c=df['transparency_score'], cmap='viridis', alpha=0.6)
    axes[1, 1].set_title('Budget Allocation vs Transparency')
    axes[1, 1].set_xlabel('Date')
    axes[1, 1].set_ylabel('Budget Allocation ($)')
    cbar = plt.colorbar(axes[1, 1].collections[0], ax=axes[1, 1])
    cbar.set_label('Transparency Score')
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save visualization
    output_path = 'demo/civic_data_analysis.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✅ Visualization saved to {output_path}")
    
    return fig


def export_results(df, analysis_results):
    """
    Export processed data and analysis results.
    """
    print("\n💾 Exporting results...")
    
    # Export CSV
    csv_path = 'demo/processed_civic_data.csv'
    df.to_csv(csv_path, index=False)
    print(f"  ✅ Data exported to {csv_path}")
    
    # Export JSON
    json_path = 'demo/analysis_results.json'
    with open(json_path, 'w') as f:
        # Convert numpy types to Python types for JSON serialization
        json_safe_results = {
            k: (v.item() if isinstance(v, (np.integer, np.floating)) else 
                v if not isinstance(v, dict) else 
                {k2: v2 for k2, v2 in v.items()})
            for k, v in analysis_results.items()
        }
        json.dump(json_safe_results, f, indent=2, default=str)
    print(f"  ✅ Results exported to {json_path}")


def main():
    """
    Main demo execution.
    """
    print("="*60)
    print("🛡️  CIVWATCH Data Ingestion & Analysis Demo")
    print("="*60)
    
    # Step 1: Generate/Ingest Data
    civic_data = generate_sample_civic_data(num_records=100)
    
    # Step 2: Analyze Data
    results = analyze_data(civic_data)
    
    # Step 3: Visualize
    visualize_data(civic_data)
    
    # Step 4: Export Results
    export_results(civic_data, results)
    
    print("\n" + "="*60)
    print("✨ Demo completed successfully!")
    print("="*60)
    print("\nNext Steps:")
    print("  1. Review generated visualizations in demo/civic_data_analysis.png")
    print("  2. Check processed data in demo/processed_civic_data.csv")
    print("  3. Examine analysis results in demo/analysis_results.json")
    print("  4. Integrate with CIVWATCH ML pipeline for sentiment analysis")
    print("\nFor more information, see: docs/README.md")


if __name__ == '__main__':
    main()
